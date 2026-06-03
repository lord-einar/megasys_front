import { useState } from 'react'
import LoginLoadingScreen from '../components/LoginLoadingScreen'

export default function LoginLoadingPreview() {
  const [key, setKey] = useState(0)
  const [manualStep, setManualStep] = useState(null)

  const reset = () => {
    setManualStep(null)
    setKey(k => k + 1)
  }

  return (
    <div className="relative">
      <LoginLoadingScreen key={key} currentStep={manualStep ?? undefined} />

      {/* Preview controls — only visible in this preview route */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 bg-white/95 backdrop-blur border border-surface-200 rounded-xl shadow-lg p-3 text-xs">
        <p className="text-[10px] uppercase tracking-widest font-bold text-surface-400 mb-1">
          Preview
        </p>
        <button
          onClick={reset}
          className="px-3 py-1.5 bg-surface-900 text-white font-medium rounded-lg hover:bg-surface-800 transition-colors"
        >
          Reiniciar animación
        </button>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map(s => (
            <button
              key={s}
              onClick={() => setManualStep(s)}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                manualStep === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {s === 3 ? '✓' : `Paso ${s + 1}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
