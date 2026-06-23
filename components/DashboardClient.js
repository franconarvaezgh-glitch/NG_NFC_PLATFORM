'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { actualizarPerfilAutenticado, cerrarSesion } from '@/app/actions';
import {
  User,
  Briefcase,
  Building,
  Phone,
  Globe,
  Instagram,
  Linkedin,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  CreditCard,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export default function DashboardClient({ profile, serialToken, email, token }) {
  const router = useRouter();

  // Estados del Formulario
  const [nombre, setNombre] = useState(profile.nombre || '');
  const [cargo, setCargo] = useState(profile.cargo || '');
  const [empresa, setEmpresa] = useState(profile.empresa || '');
  const [telefono, setTelefono] = useState(profile.telefono || '');
  
  // Archivo y Vista previa del Logotipo
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(profile.logo_url || '');
  
  // Redes
  const [instagram, setInstagram] = useState(profile.redes?.instagram || '');
  const [linkedin, setLinkedin] = useState(profile.redes?.linkedin || '');
  const [website, setWebsite] = useState(profile.redes?.website || '');
  const [whatsapp, setWhatsapp] = useState(profile.redes?.whatsapp || '');

  // Estados de carga e interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('El archivo seleccionado supera el límite permitido de 3MB.');
        return;
      }
      setError(null);
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const redesJson = {
        instagram: instagram || undefined,
        linkedin: linkedin || undefined,
        website: website || undefined,
        email: email || undefined,
        whatsapp: whatsapp || undefined
      };

      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('cargo', cargo);
      formData.append('empresa', empresa);
      formData.append('telefono', telefono);
      formData.append('redes', JSON.stringify(redesJson));
      
      if (logoFile) {
        formData.append('logoFile', logoFile);
      } else {
        formData.append('logoUrl', logoUrl);
      }

      const result = await actualizarPerfilAutenticado(token, formData);

      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Si el archivo fue subido, refrescar la página para actualizar el estado del perfil
        if (logoFile) {
          router.refresh();
        }
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error inesperado al actualizar tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      const res = await cerrarSesion();
      if (res.success) {
        router.refresh();
        router.push('/');
      }
    }
  };

  return (
    <div className="w-full max-w-2xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
      
      {/* Header del Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Mi Dashboard</span>
            <span className="text-xs py-1 px-2.5 bg-blue-500/10 text-blue-400 font-semibold rounded-full border border-blue-500/20">
              Autogestión
            </span>
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            Gestiona la información pública de tu tarjeta NFC en tiempo real
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">Sesión iniciada como: {email}</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-red-400 bg-neutral-950/40 hover:bg-red-500/10 border border-neutral-850 hover:border-red-500/20 rounded-xl px-3 py-2 transition duration-200 cursor-pointer self-start md:self-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Alertas */}
      {success && (
        <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>Tus datos se han actualizado con éxito en Supabase y ya son públicos.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Enlace rápido a la tarjeta física vinculada */}
      {serialToken && (
        <div className="mb-6 p-4 bg-blue-950/20 border border-blue-900/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-neutral-300 text-sm">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span>
              Tarjeta vinculada: <strong className="text-white">{serialToken}</strong>
            </span>
          </div>
          <a
            href={`/t/${serialToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Ver Tarjeta Pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Sección 1: Datos Personales */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span>1. Datos de Contacto</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">Nombre Completo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">Cargo / Ocupación</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Briefcase className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ej. Director Ejecutivo"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">Empresa</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Building className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej. NG Marketing BTL"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">Teléfono Móvil</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. +51 987654321"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Carga de Logo/Foto de Perfil */}
        <div>
          <label className="block text-xs font-semibold text-neutral-400 mb-2">
            Logotipo Corporativo o Foto de Perfil
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-neutral-950/40 border border-neutral-850 rounded-2xl">
            {/* Preview circular */}
            <div className="w-20 h-20 rounded-full bg-white border border-neutral-800 overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Vista previa"
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span class="text-2xl font-bold text-blue-500">NG</span>';
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-blue-500">NG</span>
              )}
            </div>
            
            {/* Botón de carga */}
            <div className="flex-grow text-center sm:text-left space-y-1.5">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-file-input"
              />
              <label
                htmlFor="logo-file-input"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-850 hover:text-white border border-neutral-800 hover:border-blue-500/40 rounded-xl text-xs font-bold text-neutral-300 cursor-pointer transition duration-200"
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Subir Imagen / Logo</span>
              </label>
              <p className="text-[10px] text-neutral-500">
                Soporta archivos PNG, JPG o WEBP. Tamaño máximo recomendado: 3MB.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800/60 my-6" />

        {/* Sección 2: Redes Sociales */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span>2. Enlaces Sociales</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">Instagram</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Instagram className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Usuario de Instagram (ej: juan.nfc)"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">LinkedIn</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Linkedin className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="URL de perfil (ej: in/juan-perez)"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">Sitio Web</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Globe className="w-4 h-4" />
                </span>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://tuweb.com"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">WhatsApp</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Phone className="w-4 h-4 text-emerald-500" />
                </span>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setwhatsapp(e.target.value)}
                  placeholder="Número con código (ej: +51987654321)"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Guardando cambios...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Actualizar Datos</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
