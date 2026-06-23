'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verificarTarjeta, activarTarjeta } from '@/app/actions';
import {
  CreditCard,
  User,
  Briefcase,
  Building,
  Phone,
  Mail,
  Lock,
  Globe,
  Linkedin,
  Instagram,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload
} from 'lucide-react';

export default function ActivarClient({ initialSerial }) {
  const router = useRouter();

  // Estados
  const [serial, setSerial] = useState(initialSerial || '');
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Campos de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Archivo y vista previa del Logotipo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Redes sociales
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('El logotipo seleccionado supera el límite permitido de 3MB.');
        return;
      }
      setError(null);
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!serial) {
      setError('Por favor, ingresa el código serial de tu tarjeta.');
      setLoading(false);
      return;
    }

    try {
      const redesJson = {
        instagram: instagram || undefined,
        linkedin: linkedin || undefined,
        website: website || undefined,
        email: email || undefined,
        whatsapp: whatsapp || undefined
      };

      const formData = new FormData();
      formData.append('serial', serial);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('isLoginMode', isLoginMode);

      if (!isLoginMode) {
        formData.append('nombre', nombre);
        formData.append('cargo', cargo);
        formData.append('empresa', empresa);
        formData.append('telefono', telefono);
        formData.append('redes', JSON.stringify(redesJson));
        
        if (logoFile) {
          formData.append('logoFile', logoFile);
        }
      }

      // Invocar Server Action de activación con FormData
      const result = await activarTarjeta(formData);

      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error inesperado al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center">
        <CheckCircle className="w-16 h-16 text-blue-500 mb-6 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">¡Activación Exitosa!</h2>
        <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
          Tu tarjeta física NFC ahora está enlazada con tu perfil digital ejecutivo. Puedes editar tus datos o compartirlos en cualquier momento.
        </p>
        
        <button
          onClick={() => router.push(`/t/${encodeURIComponent(serial)}`)}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 transition duration-200 cursor-pointer"
        >
          <span>Ver mi Tarjeta Digital</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl" />

      {/* Header de la Agencia con Logotipo Oficial */}
      <div className="text-center mb-8 relative">
        <img 
          src="/logo.jpg" 
          alt="NG Marketing Logo" 
          className="w-14 h-14 object-contain mx-auto bg-white p-1 rounded-2xl border border-neutral-800 mb-4 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-white tracking-tight">Activa tu Tarjeta NFC</h2>
        <p className="text-neutral-400 text-sm mt-1">
          Crea tu perfil ejecutivo y vincula tu token físico autogestionable
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-800/40 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Serial NFC */}
        <div>
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            Código Serial de Tarjeta
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500">
              <Sparkles className="w-5 h-5" />
            </span>
            <input
              type="text"
              required
              disabled={!!initialSerial}
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Ej. NFC_GOLD_123"
              className="w-full bg-neutral-950/60 border border-neutral-800 focus:border-blue-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition duration-200 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="border-t border-neutral-800/60 my-6" />

        {/* Sección: Credenciales de Acceso */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span>1. Credenciales de Acceso</span>
            <span className="text-xs text-neutral-500 font-normal">(Para autogestionar tus datos)</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">Contraseña</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Datos de Perfil (Solo en Registro) */}
        {!isLoginMode && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>2. Perfil de Tarjeta Digital</span>
              <span className="text-xs text-neutral-500 font-normal">(Público al escanear)</span>
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
                    required={!isLoginMode}
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
                    required={!isLoginMode}
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ej. Director de Marketing"
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
                    required={!isLoginMode}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. +51 987654321"
                    className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Carga de Logo/Foto de Perfil en Registro */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2">
                Logotipo o Foto de Perfil
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-neutral-950/40 border border-neutral-850 rounded-2xl">
                {/* Preview circular */}
                <div className="w-16 h-16 rounded-full bg-white border border-neutral-800 overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Vista previa"
                      className="w-full h-full object-contain rounded-full"
                    />
                  ) : (
                    <span className="text-xl font-bold text-blue-500">NG</span>
                  )}
                </div>
                
                {/* Botón de carga */}
                <div className="flex-grow text-center sm:text-left space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="logo-register-input"
                  />
                  <label
                    htmlFor="logo-register-input"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-850 hover:text-white border border-neutral-800 hover:border-blue-500/40 rounded-xl text-xs font-bold text-neutral-300 cursor-pointer transition duration-200"
                  >
                    <Upload className="w-4 h-4 text-blue-500" />
                    <span>Subir Imagen</span>
                  </label>
                  <p className="text-[9px] text-neutral-500">
                    Soporta PNG, JPG o WEBP. Máx 3MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-800/40 my-4" />

            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>3. Redes Sociales e Enlaces</span>
              <span className="text-xs text-neutral-500 font-normal">(Opcionales)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">Usuario de Instagram</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                    <Instagram className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Ej. juan.nfc"
                    className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">Usuario de LinkedIn</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                    <Linkedin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="Ej. in/juan-perez"
                    className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">Sitio Web Corporativo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://ngmarketingbtl.netlify.app"
                    className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">Número WhatsApp (con código)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-500">
                    <Phone className="w-4 h-4 text-emerald-500" />
                  </span>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej. +51987654321"
                    className="w-full bg-neutral-950/40 border border-neutral-850 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <span>{isLoginMode ? 'Vincular Tarjeta con mi Cuenta' : 'Activar y Crear Perfil Digital'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Selector de Modo (Login vs Registro) */}
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setError(null);
          }}
          className="text-xs text-neutral-400 hover:text-blue-400 transition duration-200"
        >
          {isLoginMode
            ? '¿No tienes cuenta? Registra tu perfil ejecutivo aquí'
            : '¿Ya tienes una cuenta activada? Inicia sesión para vincular'}
        </button>
      </div>
    </div>
  );
}
