'use client';

import React, { useState } from 'react';
import {
  Phone,
  Briefcase,
  Building,
  Mail,
  Globe,
  Linkedin,
  Instagram,
  Download,
  Share2,
  Check,
  ExternalLink
} from 'lucide-react';

const WhatsAppIcon = (props) => (
  <svg
    viewBox="0 0 16 16"
    width="24"
    height="24"
    fill="currentColor"
    className={props.className}
  >
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m11.685-4.982c-.202-.1-.404-.606-.472-.67-.067-.066-.149-.088-.225-.013-.08.077-.322.38-.395.464-.072.085-.145.097-.25.045a5.5 5.5 0 0 1-1.71-1.054 5.8 5.8 0 0 1-1.185-1.476c-.118-.2-.01-.31.09-.41.09-.09.202-.24.302-.36.1-.12.133-.2.202-.332.066-.133.033-.25-.016-.35-.05-.1-.45-1.085-.615-1.48-.16-.39-.325-.337-.447-.343a8 8 0 0 0-.38-.007c-.13 0-.34.05-.518.25-.178.2-.68.666-.68 1.625s.7 1.888.8 2.022c.1.133 1.372 2.1 3.325 2.946.466.2.83.32 1.112.41a3 3 0 0 0 1.342.08c.328-.05.996-.41 1.136-.8.14-.395.14-.73.098-.8-.04-.07-.16-.115-.362-.215"/>
  </svg>
);

export default function ProfileCard({ profile, serialToken }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadVCF = () => {
    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.nombre}`,
      `N:${profile.nombre.split(' ').reverse().join(';')};;;`,
      profile.empresa ? `ORG:${profile.empresa}` : '',
      profile.cargo ? `TITLE:${profile.cargo}` : '',
      profile.telefono ? `TEL;TYPE=CELL,VOICE:${profile.telefono}` : '',
      profile.redes?.email ? `EMAIL;TYPE=PREF,INTERNET:${profile.redes.email}` : '',
      profile.redes?.website ? `URL:${profile.redes.website}` : '',
      profile.redes?.linkedin ? `URL;type=linkedin:${profile.redes.linkedin}` : '',
      'END:VCARD'
    ];

    const vcardContent = vcardLines.filter(Boolean).join('\n');
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${profile.nombre.replace(/\s+/g, '_')}_contacto.vcf`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mapeo de redes sociales para iteración elegante
  const socialNetworks = [
    {
      key: 'whatsapp',
      icon: <WhatsAppIcon className="w-5 h-5" />,
      label: 'WhatsApp',
      color: 'hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/30'
    },
    {
      key: 'linkedin',
      icon: <Linkedin className="w-5 h-5" />,
      label: 'LinkedIn',
      color: 'hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/30'
    },
    {
      key: 'instagram',
      icon: <Instagram className="w-5 h-5" />,
      label: 'Instagram',
      color: 'hover:bg-pink-600/20 hover:text-pink-400 hover:border-pink-500/30'
    },
    {
      key: 'website',
      icon: <Globe className="w-5 h-5" />,
      label: 'Web',
      color: 'hover:bg-blue-600/20 hover:text-blue-400 hover:border-blue-500/30'
    },
    {
      key: 'email',
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
      color: 'hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30'
    }
  ];

  // Cargar logotipo de perfil, por defecto el nuevo logo corporativo de la agencia
  const logoSrc = profile.logo_url || '/logo.jpg';

  return (
    <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-fade-in">
      {/* Detalle visual decorativo estilo neon */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-750/5 rounded-full blur-3xl" />

      {/* Header: Logo y Foto de Perfil */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-tilt" />
          <div className="relative w-24 h-24 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center p-1">
            <img
              src={logoSrc}
              alt={`Logo de ${profile.nombre}`}
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="text-3xl font-bold text-blue-500">NG</span>';
              }}
            />
          </div>
        </div>

        {/* Nombre y Cargo */}
        <h1 className="text-2xl font-bold mt-4 tracking-tight text-white">{profile.nombre}</h1>
        <div className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold mt-1">
          <Briefcase className="w-4 h-4" />
          <span>{profile.cargo || 'Ejecutivo'}</span>
        </div>

        {/* Empresa */}
        {profile.empresa && (
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs mt-1">
            <Building className="w-3.5 h-3.5" />
            <span>{profile.empresa}</span>
          </div>
        )}
      </div>

      {/* Acciones principales */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleDownloadVCF}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-550/10 hover:shadow-blue-550/20 active:scale-98 transition duration-200 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>Guardar Contacto</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {profile.telefono && (
            <a
              href={`tel:${profile.telefono}`}
              className="py-3 px-4 bg-neutral-950/60 hover:bg-neutral-800/40 border border-neutral-800 rounded-xl flex items-center justify-center gap-2 text-neutral-300 hover:text-white transition duration-200"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Llamar</span>
            </a>
          )}
          <button
            onClick={handleCopyLink}
            className="py-3 px-4 bg-neutral-950/60 hover:bg-neutral-800/40 border border-neutral-800 rounded-xl flex items-center justify-center gap-2 text-neutral-300 hover:text-white transition duration-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Compartir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Redes Sociales e Enlaces */}
      <div className="mt-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
          Conéctate Conmigo
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {socialNetworks.map((net) => {
            const val = profile.redes?.[net.key];
            if (!val) return null;

            let href = val;
            if (net.key === 'email') href = `mailto:${val}`;
            else if (net.key === 'whatsapp') href = `https://wa.me/${val.replace(/[^0-9]/g, '')}`;
            else if (!/^https?:\/\//i.test(val)) href = `https://${val}`;

            return (
              <a
                key={net.key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl transition duration-300 text-neutral-400 hover:text-white ${net.color}`}
              >
                <div className="flex-shrink-0">{net.icon}</div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-neutral-500 font-medium leading-none">
                    {net.label}
                  </span>
                  <span className="text-sm font-semibold truncate mt-0.5">
                    {val.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/,'')}
                  </span>
                </div>
                <ExternalLink className="w-3 h-3 ml-auto opacity-40 flex-shrink-0" />
              </a>
            );
          })}
        </div>
        
        {(!profile.redes || Object.keys(profile.redes).length === 0) && (
          <p className="text-sm text-neutral-600 italic">No hay enlaces adicionales configurados.</p>
        )}
      </div>

      {/* Animación personalizada */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
