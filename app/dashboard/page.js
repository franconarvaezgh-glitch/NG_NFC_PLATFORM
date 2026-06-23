import { cookies } from 'next/headers';
import { obtenerPerfilAutenticado } from '@/app/actions';
import DashboardClient from '@/components/DashboardClient';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Dashboard de Autogestión - NG NFC',
  description: 'Edita tu perfil digital, redes sociales, teléfono y logo en tiempo real.',
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb_access_token')?.value;

  let authResult = null;

  if (token) {
    // Validar token y obtener perfil en el servidor
    authResult = await obtenerPerfilAutenticado(token);
  }

  // Si no está autenticado o la sesión falló, mostrar pantalla de inicio de sesión
  if (!token || !authResult || !authResult.success) {
    return (
      <div className="min-h-screen bg-radial from-neutral-900 to-black text-neutral-100 flex flex-col justify-between font-sans">
        <main className="flex-grow flex items-center justify-center p-4">
          <LoginClient />
        </main>
        <footer className="py-6 text-center text-xs text-neutral-600 border-t border-neutral-900/50 bg-black/40">
          <p>© 2026 NG Marketing. Todos los derechos reservados.</p>
        </footer>
      </div>
    );
  }

  // Si está autenticado con éxito, renderizar el Dashboard de autogestión
  return (
    <div className="min-h-screen bg-radial from-neutral-900 to-black text-neutral-100 flex flex-col justify-between font-sans">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <DashboardClient
          profile={authResult.perfil}
          serialToken={authResult.serialToken}
          email={authResult.email}
          token={token}
        />
      </main>

      <footer className="py-6 text-center text-xs text-neutral-500 border-t border-neutral-900/50 bg-black/40 backdrop-blur-md">
        <p>
          Panel de Autogestión • Potenciado por{' '}
          <a
            href="https://ngmarketingbtl.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-blue-400 transition-colors font-medium"
          >
            NG Marketing
          </a>
        </p>
      </footer>
    </div>
  );
}
