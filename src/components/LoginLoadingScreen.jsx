import logo from '../assets/logo.png'

// Pantalla de espera mientras se valida el ingreso. Usa el mismo fondo petróleo
// que la columna de marca del login para que la transición no "salte".
export default function LoginLoadingScreen({ message = 'Verificando tu acceso…' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-nav-bg p-6" role="status" aria-live="polite">
      {/* El PNG es negro sobre blanco: invert + screen lo deja blanco sobre el fondo */}
      <img src={logo} alt="Grupo Megatlon" className="h-9 w-auto invert mix-blend-screen" />

      <div
        className="h-8 w-8 rounded-full border-[3px] border-white/20 border-t-nav-mark motion-safe:animate-spin"
        aria-hidden="true"
      />

      <p className="text-base text-nav-text">{message}</p>
    </div>
  )
}
