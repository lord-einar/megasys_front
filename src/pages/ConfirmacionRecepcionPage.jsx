import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { remitosAPI } from '../services/api'
import Swal from 'sweetalert2'

function ConfirmacionRecepcionPage() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState(null)
  const [remitoData, setRemitoData] = useState(null)

  const remitoId = searchParams.get('remito')
  const token = searchParams.get('token')

  useEffect(() => {
    const confirmarRecepcion = async () => {
      try {
        if (!remitoId || !token) {
          throw new Error('Parámetros faltantes: remito y token son requeridos')
        }

        setLoading(true)
        const response = await remitosAPI.confirmarRecepcion(remitoId, token)

        // La respuesta tiene estructura: { success: true, data: {...}, message: "..." }
        // Accedemos a la propiedad 'data' que contiene los detalles del remito
        setRemitoData(response.data)
        setConfirmed(true)
        setError(null)
      } catch (err) {
        console.error('Error confirmando recepción:', err)
        setError(err.message || 'Error al confirmar la recepción del remito')
        setConfirmed(false)
      } finally {
        setLoading(false)
      }
    }

    confirmarRecepcion()
  }, [remitoId, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Procesando confirmación...
          </h2>
          <p className="text-gray-600">Por favor espera mientras confirmamos la recepción de tu remito</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0H9m3 0h3" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Error en la confirmación
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="text-sm text-gray-500 text-center">
            <p>Si el problema persiste, por favor contacta a infraestructura@megatlon.com.ar</p>
          </div>
        </div>
      </div>
    )
  }

  if (confirmed && remitoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-green-600 mb-2 text-center">
            ¡Recepción Confirmada!
          </h1>

          <p className="text-gray-600 text-center mb-6">
            La recepción del remito ha sido confirmada exitosamente
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="mb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Número de Remito</p>
              <p className="text-lg font-bold text-gray-800">{remitoData.numeroRemito}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Estado</p>
              <p className="text-lg font-bold text-green-600">{remitoData.estado}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Fecha de Confirmación</p>
              <p className="text-lg font-bold text-gray-800">{remitoData.fechaConfirmacion}</p>
            </div>
          </div>

          <div className="space-y-3">
            {remitoData.pdfConfirmado && (
              <a
                href={remitoData.pdfConfirmado.startsWith('http')
                  ? remitoData.pdfConfirmado
                  : `http://localhost:4000${remitoData.pdfConfirmado}`}
                download={`Remito_${remitoData.numeroRemito}_Confirmado.pdf`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
              >
                📥 Descargar PDF de Confirmación
              </a>
            )}

            <p className="text-sm text-gray-500 text-center mt-4">
              Se ha enviado un email de confirmación a tu correo electrónico
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default ConfirmacionRecepcionPage
