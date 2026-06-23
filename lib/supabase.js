import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

const isUrlValid = (url) => {
  return typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'));
};

const getEnv = (key) => {
  return typeof process !== 'undefined' ? process.env[key] || '' : '';
};

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  // Usar sintaxis de corchetes para evitar que Next.js reemplace la variable en tiempo de compilación
  const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (isUrlValid(supabaseUrl) && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Advertencia: El cliente de Supabase no se pudo inicializar. URL o clave inválidas.');
  }

  return supabaseInstance;
};
