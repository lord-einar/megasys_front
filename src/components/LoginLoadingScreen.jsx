import logo from '../assets/logo.png'

export default function LoginLoadingScreen({ message = 'Verificando tu acceso...' }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: '#020617' }}
    >
      {/* Same subtle grid as the login page */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-7">
        <img src={logo} alt="Grupo Megatlon" className="h-11 w-auto" />

        <div className="w-7 h-7 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />

        <p className="text-sm font-medium text-surface-500">{message}</p>
      </div>

      <p className="absolute bottom-8 text-[10px] uppercase tracking-widest font-bold text-surface-700">
        Portal IT · Megatlon
      </p>
    </div>
  )
}
