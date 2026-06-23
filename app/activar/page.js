import ActivarClient from './ActivarClient';

// Deshabilitar caché para leer parámetros en tiempo real
export const dynamic = 'force-dynamic';

export default async function ActivarPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const serial = resolvedParams?.serial || '';

  return <ActivarClient initialSerial={serial} />;
}
