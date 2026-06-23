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
