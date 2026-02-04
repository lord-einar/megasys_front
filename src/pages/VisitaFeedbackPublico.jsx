import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function VisitaFeedbackPublico() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [visitaInfo, setVisitaInfo] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        comentarios: ''
    });

    useEffect(() => {
        cargarInfoVisita();
    }, [token]);

    const cargarInfoVisita = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${API_BASE}/visitas/feedback/${token}`);
            setVisitaInfo(response.data.data);
        } catch (err) {
            console.error('Error cargando información:', err);
            const errorMsg = err.response?.data?.message || 'Error al cargar la información de la visita';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim() || !formData.comentarios.trim()) {
            setError('Por favor completa todos los campos');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            await axios.post(`${API_BASE}/visitas/feedback/${token}`, {
                nombre: formData.nombre.trim(),
                comentarios: formData.comentarios.trim()
            });

            setSuccess(true);
        } catch (err) {
            console.error('Error enviando comentarios:', err);
            const errorMsg = err.response?.data?.message || 'Error al enviar los comentarios';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600 font-medium">Cargando información...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Gracias por tu feedback!</h2>
                    <p className="text-slate-600 mb-6">
                        Tus comentarios han sido enviados exitosamente y serán revisados por el equipo de infraestructura.
                    </p>
                    <button
                        onClick={() => window.close()}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    if (error && !visitaInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.close()}
                        className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    // Si no hay información de visita, no renderizar el formulario
    if (!visitaInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600 font-medium">Cargando información...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">💬 Feedback de Visita</h1>
                    <p className="text-blue-100">Tu opinión nos ayuda a mejorar nuestro servicio</p>
                </div>

                {/* Info Visita */}
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-600">Sede</p>
                            <p className="font-semibold text-slate-900">{visitaInfo.sede}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Fecha de visita</p>
                            <p className="font-semibold text-slate-900">{new Date(visitaInfo.fecha).toLocaleDateString('es-AR')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Técnico</p>
                            <p className="font-semibold text-slate-900">{visitaInfo.tecnico}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Tiempo restante</p>
                            <p className="font-semibold text-amber-600">
                                {visitaInfo.diasRestantes > 0 ? `${visitaInfo.diasRestantes} día(s)` : 'Último día'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-2">
                            Tu nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: Juan Pérez"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            disabled={submitting}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="comentarios" className="block text-sm font-semibold text-slate-700 mb-2">
                            ¿Cómo fue la visita? <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-2">
                            Cuéntanos sobre la visita del técnico, si se resolvieron tus problemas, o si hay algo que debamos saber.
                        </p>
                        <textarea
                            id="comentarios"
                            value={formData.comentarios}
                            onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                            rows="6"
                            placeholder="Ej: El técnico fue muy profesional y resolvió todos los problemas. El servicio fue excelente..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            disabled={submitting}
                            required
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            {formData.comentarios.length} caracteres
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Enviar Comentarios
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-center text-slate-500 mt-4">
                        Tus comentarios serán enviados al equipo de infraestructura y al técnico asignado.
                    </p>
                </form>
            </div>
        </div>
    );
}
