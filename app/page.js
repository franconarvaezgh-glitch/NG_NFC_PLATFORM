import React from 'react';
import Link from 'next/link';
import { CreditCard, Sparkles, UserCheck, Share2, ArrowRight, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'NG NFC Platform - Tarjetas Digitales Autogestionables',
  description: 'Conecta al instante con tus clientes de forma interactiva y premium. Creado por NG Marketing BTL.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-radial from-neutral-900 to-black text-neutral-100 flex flex-col justify-between font-sans">
      
      {/* Navbar Minimalista */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-neutral-850/40">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.jpg" 
            alt="NG Marketing Logo" 
            className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-neutral-800"
          />
          <span className="font-bold text-white tracking-wider text-sm md:text-base">
            NFC PLATFORM
          </span>
        </div>
        
        <a
          href="https://ngmarketingbtl.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs md:text-sm text-neutral-400 hover:text-blue-400 flex items-center gap-1.5 transition duration-200"
        >
          <span>Agencia BTL</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 md:py-24 flex flex-col md:flex-row items-center gap-12 flex-grow">
        
        {/* Lado Izquierdo: Textos */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nueva Generación de Networking</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Tus datos de contacto, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600">
              a un solo toque.
            </span>
          </h1>
          
          <p className="text-neutral-400 text-base md:text-lg max-w-xl leading-relaxed mx-auto md:mx-0">
            La plataforma oficial de tarjetas NFC autogestionables de **NG Marketing**. Diseñada para ejecutivos y marcas de alto impacto que buscan automatizar su red de contactos con elegancia.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
            <Link
              href="/activar"
              className="w-full sm:w-auto py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98 transition duration-200 cursor-pointer"
            >
              <span>Activar Tarjeta Física</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a
              href="https://ngmarketingbtl.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-4 px-8 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 rounded-2xl flex items-center justify-center gap-2 text-neutral-300 hover:text-white transition duration-200"
            >
              <span>Conoce nuestra Agencia</span>
            </a>
          </div>
        </div>

        {/* Lado Derecho: Simulación de Tarjeta / Mockup Visual */}
        <div className="flex-1 w-full max-w-md relative flex justify-center">
          <div className="absolute inset-0 bg-blue-500/10 rounded-full filter blur-3xl" />
          
          {/* Tarjeta Ejecutiva Flotante */}
          <div className="relative w-80 h-48 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
            {/* Chip NFC */}
            <div className="flex justify-between items-start">
              <div className="w-10 h-8 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-lg border border-neutral-600/40 relative overflow-hidden flex items-center justify-center">
                <div className="w-6 h-4 border border-neutral-500/40 rounded" />
              </div>
              <img 
                src="/logo.jpg" 
                alt="NG Logo" 
                className="w-12 h-6 object-contain bg-white p-0.5 rounded border border-neutral-800"
              />
            </div>
            
            {/* Contenido */}
            <div className="space-y-1">
              <p className="text-neutral-500 text-[10px] uppercase tracking-widest leading-none">NFC SMART CARD</p>
              <p className="text-white text-base font-semibold leading-none">Juan Pérez</p>
              <p className="text-blue-400 text-xs font-medium">Director Ejecutivo</p>
            </div>

            {/* Simulación de Ondas NFC */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 rounded-full border border-blue-500/40 animate-ping absolute" />
              <div className="w-12 h-12 rounded-full border border-blue-500/20 animate-ping absolute" />
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </main>

      {/* Características / Pasos */}
      <section className="bg-neutral-950/50 border-y border-neutral-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Paso 1 */}
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-blue-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">1. Escanea tu Tarjeta</h3>
              <p className="text-neutral-400 text-sm mt-1">
                Acerca el chip NFC físico al smartphone para iniciar el emparejamiento digital en milisegundos.
              </p>
            </div>
          </div>
          
          {/* Paso 2 */}
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-blue-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">2. Crea tu Perfil</h3>
              <p className="text-neutral-400 text-sm mt-1">
                Escribe tu información de contacto corporativa y asocia tus redes sociales profesionales.
              </p>
            </div>
          </div>
          
          {/* Paso 3 */}
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-blue-500">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">3. Comparte al Instante</h3>
              <p className="text-neutral-400 text-sm mt-1">
                Tus clientes podrán descargar tu contacto nativo (.vcf) directamente en su agenda sin apps.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-neutral-600">
        <p>© 2026 NG Marketing. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}
