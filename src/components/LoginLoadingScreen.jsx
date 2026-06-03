import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

const STEPS = [
  { label: 'Conectando con Microsoft' },
  { label: 'Verificando tu identidad' },
  { label: 'Preparando tu espacio de trabajo' },
]

function StepRow({ label, state }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {state === 'done' && (
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-[pop_0.3s_ease-out]">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {state === 'active' && (
          <div className="w-5 h-5 rounded-full border-2 border-surface-200 border-t-primary-600 animate-spin" />
        )}
        {state === 'pending' && (
          <div className="w-5 h-5 rounded-full border-2 border-surface-200" />
        )}
      </div>
      <span
        className={`font-medium transition-colors duration-300 ${
          state === 'pending' ? 'text-surface-400' : 'text-surface-900'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export default function LoginLoadingScreen({
  currentStep,
  message = 'Bienvenido, te estamos preparando todo',
}) {
  const [internalStep, setInternalStep] = useState(0)
  const step = currentStep ?? internalStep

  useEffect(() => {
    if (currentStep !== undefined) return
    const timers = [
      setTimeout(() => setInternalStep(1), 1100),
      setTimeout(() => setInternalStep(2), 2200),
      setTimeout(() => setInternalStep(3), 3300),
    ]
    return () => timers.forEach(clearTimeout)
  }, [currentStep])

  const progress = Math.min(((step) / STEPS.length) * 100 + 8, 100)

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle blueprint grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <div className="mb-10">
          <img src={logo} alt="Grupo Megatlon" className="h-14 w-auto" />
        </div>

        {/* Message */}
        <h1 className="text-xl font-bold text-surface-900 tracking-tight text-center">
          {message}
        </h1>
        <p className="text-sm text-surface-500 mt-1.5 mb-10 font-medium text-center">
          Esto solo toma un momento
        </p>

        {/* Steps */}
        <div className="w-full space-y-4 mb-10">
          {STEPS.map((s, i) => (
            <StepRow
              key={s.label}
              label={s.label}
              state={i < step ? 'done' : i === step ? 'active' : 'pending'}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-[3px] bg-surface-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1.5 z-10">
        <div className="flex items-center gap-2 text-xs text-surface-400 font-medium">
          <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Acceso corporativo protegido</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold text-surface-400">
          Portal IT · Megatlon
        </p>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
