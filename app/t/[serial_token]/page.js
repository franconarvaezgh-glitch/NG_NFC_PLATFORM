import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProfileCard from '@/components/ProfileCard';

// Forzar renderizado dinámico en cada request
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CardRedirectPage({ params }) {
  const { serial_token } = await params;

  if (!serial_token) {
    redirect('/activar');
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-black text-red-550 flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Error de Configuración</h2>
          <p className="text-sm text-neutral-400">El servidor de Supabase no está configurado. Por favor, verifica tus variables de entorno.</p>
        </div>
      </div>
    );
  }

  // 1. Consultar la tarjeta en Supabase
  const { data: tarjeta, error: tarjetaError } = await supabase
    .from('tarjetas')
    .select('usuario_id')
    .eq('serial_token', serial_token)
    .maybeSingle(); // Usar maybeSingle para evitar excepciones si no hay registros

  // Si no existe la tarjeta o no tiene usuario asignado, redirigir a /activar
  if (tarjetaError || !tarjeta || !tarjeta.usuario_id) {
    redirect(`/activar?serial=${encodeURIComponent(serial_token)}`);
  }

  // 2. Si tiene dueño, obtener su perfil digital
  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', tarjeta.usuario_id)
    .maybeSingle();

  // Si el perfil no existe por alguna anomalía, redirigir a /activar
  if (perfilError || !perfil) {
    redirect(`/activar?serial=${encodeURIComponent(serial_token)}`);
  }

  // 3. Renderizar el perfil del cliente
  return (
    <div className="min-h-screen bg-radial from-neutral-900 to-black text-neutral-100 flex flex-col justify-between font-sans">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <ProfileCard profile={perfil} serialToken={serial_token} />
      </main>
      
      {/* Footer minimalista */}
      <footer className="py-6 text-center text-xs text-neutral-500 border-t border-neutral-900/50 bg-black/40 backdrop-blur-md">
        <p>
          Tarjeta Digital Autogestionable • Potenciado por{' '}
          <a
            href="https://ngmarketingbtl.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-yellow-500 transition-colors font-medium"
          >
            NG Marketing BTL
          </a>
        </p>
      </footer>
    </div>
  );
}
