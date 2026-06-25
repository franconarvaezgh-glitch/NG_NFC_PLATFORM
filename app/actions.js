'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isUrlValid = (url) => {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
};

let supabaseServerInstance = null;

const getEnv = (key) => {
  return typeof process !== 'undefined' ? process.env[key] || '' : '';
};

function getSupabaseServer() {
  if (supabaseServerInstance) return supabaseServerInstance;

  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (isUrlValid(url) && key) {
    supabaseServerInstance = createClient(url, key, {
      auth: {
        persistSession: false
      }
    });
  }
  return supabaseServerInstance;
}

function getSupabaseUserClient(accessToken) {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (isUrlValid(url) && key && accessToken) {
    return createClient(url, key, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        persistSession: false
      }
    });
  }
  return getSupabaseServer();
}

/**
 * Asegura que el bucket 'logos' exista en Supabase Storage y sea público.
 */
async function asegurarBucketLogos() {
  if (!getSupabaseServer()) return;
  try {
    const { data: buckets, error: listError } = await getSupabaseServer().storage.listBuckets();
    if (listError) throw listError;
    
    const existe = buckets?.some(b => b.name === 'logos');
    if (!existe) {
      console.log('Creando bucket "logos" en Supabase Storage...');
      const { error } = await getSupabaseServer().storage.createBucket('logos', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 3 * 1024 * 1024 // 3MB
      });
      if (error) {
        console.warn('Advertencia al crear bucket (posiblemente ya existe o RLS restrictiva):', error.message);
      }
    }
  } catch (e) {
    console.error('Error al asegurar bucket de logos:', e);
  }
}

/**
 * Valida si un serial existe y está libre para vinculación.
 */
export async function verificarTarjeta(serial) {
  if (!getSupabaseServer()) {
    return { success: false, error: 'El servidor de Supabase no está configurado.' };
  }

  try {
    const { data: tarjeta, error } = await getSupabaseServer()
      .from('tarjetas')
      .select('*')
      .eq('serial_token', serial)
      .maybeSingle();

    if (error) throw error;
    
    if (!tarjeta) {
      return { 
        success: false, 
        error: 'El código serial ingresado no es válido o no está registrado en nuestro sistema BTL.' 
      };
    }
    
    if (tarjeta.usuario_id) {
      return { 
        success: false, 
        error: 'Esta tarjeta ya ha sido activada por otro usuario. Si eres el dueño, inicia sesión en tu cuenta.' 
      };
    }
    
    return { success: true, tarjeta };
  } catch (error) {
    console.error('Error al verificar tarjeta:', error);
    return { success: false, error: error.message || 'Error al validar la tarjeta.' };
  }
}

/**
 * Auto-confirma el email de un usuario existente en caso de que esté pendiente.
 */
async function autoConfirmarUsuarioSiExiste(email) {
  if (!getSupabaseServer()) return false;
  try {
    const { data: { users }, error: listError } = await getSupabaseServer().auth.admin.listUsers();
    if (listError) throw listError;
    
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (user && !user.email_confirmed_at) {
      console.log(`Auto-confirmando correo para el usuario existente: ${email}`);
      const { error: updateError } = await getSupabaseServer().auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );
      if (updateError) throw updateError;
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error al intentar auto-confirmar email:', e);
    return false;
  }
}

/**
 * Registra un usuario, vincula su perfil con la tarjeta NFC y establece una sesión de cookie.
 * Soporta la carga de archivos de imagen usando FormData.
 */
export async function activarTarjeta(formData) {
  if (!getSupabaseServer()) {
    return { success: false, error: 'El servidor de Supabase no está configurado.' };
  }

  const serial = formData.get('serial');
  const email = formData.get('email');
  const password = formData.get('password');
  const nombre = formData.get('nombre');
  const cargo = formData.get('cargo');
  const empresa = formData.get('empresa');
  const telefono = formData.get('telefono');
  const redesRaw = formData.get('redes');
  const file = formData.get('logoFile');
  let logoUrl = formData.get('logoUrl') || null;
  const isLoginMode = formData.get('isLoginMode') === 'true';

  const redes = redesRaw ? JSON.parse(redesRaw) : {};

  try {
    // 1. Validar la tarjeta primero
    const checkRes = await verificarTarjeta(serial);
    if (!checkRes.success) {
      return { success: false, error: checkRes.error };
    }

    let userId = null;
    let session = null;

    if (isLoginMode) {
      // --- INICIO DE SESIÓN ---
      let { data: authData, error: authError } = await getSupabaseServer().auth.signInWithPassword({
        email,
        password
      });

      if (authError && authError.message?.toLowerCase().includes('confirm')) {
        const confirmed = await autoConfirmarUsuarioSiExiste(email);
        if (confirmed) {
          const retry = await getSupabaseServer().auth.signInWithPassword({ email, password });
          authData = retry.data;
          authError = retry.error;
        }
      }

      if (authError) throw authError;
      userId = authData.user.id;
      session = authData.session;

      // Crear perfil por defecto si no tiene
      const { data: perfilExistente } = await getSupabaseServer()
        .from('perfiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!perfilExistente) {
        const { error: profileError } = await getSupabaseServer().from('perfiles').insert({
          id: userId,
          nombre: email.split('@')[0],
          cargo: 'Miembro',
          empresa: 'NG NFC Platform'
        });
        if (profileError) throw profileError;
      }
    } else {
      // --- REGISTRO NUEVO ---
      let registeredViaAdmin = false;

      try {
        // Intentar crear usuario mediante API de Admin (para auto-confirmar el correo)
        const { data: adminUser, error: adminError } = await getSupabaseServer().auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            nombre,
            cargo,
            empresa,
            telefono,
            redes
          }
        });

        if (adminError) throw adminError;
        
        userId = adminUser.user.id;
        registeredViaAdmin = true;
      } catch (err) {
        const errMsg = err.message || '';
        // Si el error es por falta de permisos (User not allowed / anon key) o similar, usar signUp estándar
        if (
          errMsg.toLowerCase().includes('not allowed') || 
          errMsg.toLowerCase().includes('authorized') || 
          err.status === 401 || 
          err.status === 403 || 
          err.status === 400
        ) {
          console.log('API de Admin no autorizada o no disponible (posible uso de anon key). Usando signUp estándar...');
          
          const { data: signUpData, error: signUpError } = await getSupabaseServer().auth.signUp({
            email,
            password,
            options: {
              data: {
                nombre,
                cargo,
                empresa,
                telefono,
                redes
              }
            }
          });

          if (signUpError) {
            if (signUpError.message?.toLowerCase().includes('already') || signUpError.status === 422) {
              throw new Error('El correo electrónico ingresado ya está registrado.');
            }
            throw signUpError;
          }

          userId = signUpData.user.id;
          session = signUpData.session;
        } else {
          // Si el error es de registro duplicado u otro error real
          if (errMsg.toLowerCase().includes('already') || err.status === 422) {
            const confirmed = await autoConfirmarUsuarioSiExiste(email);
            if (!confirmed) {
              throw new Error('El correo electrónico ingresado ya está registrado.');
            }
          } else {
            throw err;
          }
        }
      }

      // Si nos registramos vía Admin, necesitamos iniciar sesión para obtener la sesión/token
      if (registeredViaAdmin && !session) {
        const { data: authData, error: authError } = await getSupabaseServer().auth.signInWithPassword({
          email,
          password
        });
        if (authError) throw authError;
        userId = authData.user.id;
        session = authData.session;
      }
    }
    const userClient = session ? getSupabaseUserClient(session.access_token) : getSupabaseServer();

    // --- PROCESAR CARGA DE ARCHIVO (LOGO) EN REGISTRO ---
    if (file && file.size > 0) {
      await asegurarBucketLogos();

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await userClient.storage
        .from('logos')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = userClient.storage
        .from('logos')
        .getPublicUrl(fileName);

      logoUrl = publicUrl;

      // Actualizar el perfil recién creado con la URL del logo
      await userClient
        .from('perfiles')
        .update({ logo_url: logoUrl })
        .eq('id', userId);
    }

    // 2. Vincular la tarjeta al usuario
    const { error: updateError } = await userClient
      .from('tarjetas')
      .update({ usuario_id: userId })
      .eq('serial_token', serial);

    if (updateError) throw updateError;

    // 3. Cookie de sesión
    if (session) {
      const cookieStore = await cookies();
      cookieStore.set('sb_access_token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: session.expires_in,
        path: '/'
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error en activación:', error);
    return { success: false, error: error.message || 'Error en el proceso de activación.' };
  }
}

/**
 * Obtiene el perfil de un usuario verificado mediante su JWT access_token.
 */
export async function obtenerPerfilAutenticado(accessToken) {
  if (!getSupabaseServer()) {
    return { success: false, error: 'El servidor de Supabase no está configurado.' };
  }

  try {
    const { data: { user }, error: authError } = await getSupabaseServer().auth.getUser(accessToken);
    if (authError || !user) {
      return { success: false, error: 'Sesión inválida o expirada. Por favor, vuelve a iniciar sesión.' };
    }

    const { data: perfil, error: dbError } = await getSupabaseServer()
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (dbError) throw dbError;
    if (!perfil) {
      return { success: false, error: 'Perfil no encontrado.' };
    }

    // Buscar si el usuario tiene alguna tarjeta vinculada para mostrar en el dashboard
    const { data: tarjeta } = await getSupabaseServer()
      .from('tarjetas')
      .select('serial_token')
      .eq('usuario_id', user.id)
      .maybeSingle();

    return { 
      success: true, 
      perfil, 
      serialToken: tarjeta?.serial_token || null,
      email: user.email 
    };
  } catch (error) {
    console.error('Error al obtener perfil autenticado:', error);
    return { success: false, error: error.message || 'Error al consultar el perfil.' };
  }
}

/**
 * Actualiza el perfil de un usuario verificado mediante su JWT access_token.
 * Soporta la carga de archivos de imagen usando FormData y Supabase Storage.
 */
export async function actualizarPerfilAutenticado(accessToken, formData) {
  if (!getSupabaseServer()) {
    return { success: false, error: 'El servidor de Supabase no está configurado.' };
  }

  try {
    const { data: { user }, error: authError } = await getSupabaseServer().auth.getUser(accessToken);
    if (authError || !user) {
      return { success: false, error: 'Sesión inválida o expirada. Vuelve a iniciar sesión.' };
    }

    const nombre = formData.get('nombre');
    const cargo = formData.get('cargo');
    const empresa = formData.get('empresa');
    const telefono = formData.get('telefono');
    const redesRaw = formData.get('redes');
    const file = formData.get('logoFile');
    let logoUrl = formData.get('logoUrl') || null;

    const redes = redesRaw ? JSON.parse(redesRaw) : {};

    const userClient = getSupabaseUserClient(accessToken);

    // --- PROCESAR CARGA DE ARCHIVO (LOGO) EN ACTUALIZACIÓN ---
    if (file && file.size > 0) {
      await asegurarBucketLogos();

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await userClient.storage
        .from('logos')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtener la URL pública del archivo cargado
      const { data: { publicUrl } } = userClient.storage
        .from('logos')
        .getPublicUrl(fileName);
      
      logoUrl = publicUrl;
    }

    const { error: dbError } = await userClient
      .from('perfiles')
      .update({
        nombre,
        cargo,
        empresa,
        telefono,
        logo_url: logoUrl,
        redes,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (dbError) throw dbError;
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar perfil autenticado:', error);
    return { success: false, error: error.message || 'Error al guardar los cambios.' };
  }
}

/**
 * Obtiene la sesión actual utilizando cookies HTTP-only del servidor.
 */
export async function obtenerSesionUsuario() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_access_token')?.value;
    if (!token) {
      return { success: false, error: 'No hay sesión activa.' };
    }
    return await obtenerPerfilAutenticado(token);
  } catch (error) {
    console.error('Error al obtener sesión de cookie:', error);
    return { success: false, error: 'Error al verificar la sesión.' };
  }
}

/**
 * Cierra la sesión activa borrando la cookie.
 */
export async function cerrarSesion() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('sb_access_token');
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return { success: false, error: 'Error al destruir la sesión.' };
  }
}

/**
 * Inicia sesión mediante un formulario estándar y establece la cookie de sesión.
 * Auto-confirma al usuario en caso de que esté pendiente de confirmación de email.
 */
export async function iniciarSesion(email, password) {
  if (!getSupabaseServer()) {
    return { success: false, error: 'El servidor de Supabase no está configurado.' };
  }

  try {
    let { data: authData, error: authError } = await getSupabaseServer().auth.signInWithPassword({
      email,
      password
    });

    if (authError && authError.message?.toLowerCase().includes('confirm')) {
      const confirmed = await autoConfirmarUsuarioSiExiste(email);
      if (confirmed) {
        const retry = await getSupabaseServer().auth.signInWithPassword({ email, password });
        authData = retry.data;
        authError = retry.error;
      }
    }

    if (authError) throw authError;

    if (authData.session) {
      const cookieStore = await cookies();
      cookieStore.set('sb_access_token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: authData.session.expires_in,
        path: '/'
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return { success: false, error: error.message || 'Error al iniciar sesión.' };
  }
}
