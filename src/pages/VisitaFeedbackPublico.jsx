import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/**
 * VisitaFeedbackPublico
 * 
 * Intent: Provide a frictionless, premium feedback experience for gym staff/managers.
 * Feel: Clean, modern, efficient, corporate but approachable.
 * Palette: Slate (structure), Indigo (accent), emerald/rose (feedback).
 */
export default function VisitaFeedbackPublico() {
    const { token } = useParams();

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

            const response = await axios.get(`${API_BASE_URL}/visitas/feedback/${token}`);
            setVisitaInfo(response.data.data);
        } catch (err) {
            console.error('Error cargando información:', err);
            const errorMsg = err.response?.data?.message || 'No se pudo cargar la información de la visita.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim() || !formData.comentarios.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            await axios.post(`${API_BASE_URL}/visitas/feedback/${token}`, {
                nombre: formData.nombre.trim(),
                comentarios: formData.comentarios.trim()
            });

            setSuccess(true);
        } catch (err) {
            console.error('Error enviando comentarios:', err);
            const errorMsg = err.response?.data?.message || 'Hubo un problema al enviar tus comentarios.';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Loading State ---
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center space-y-4 animate-pulse">
                    <div className="h-12 w-12 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500 tracking-wide">Cargando detalles...</p>
                </div>
            </div>
        );
    }

    // --- Success State ---
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-6 group transition-transform duration-500 hover:scale-110">
                            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Gracias!</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Tu opinión es fundamental para mejorar nuestro servicio. Hemos registrado tus comentarios correctamente.
                        </p>
                        <button
                            onClick={() => window.close()}
                            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200"
                        >
                            Cerrar pestaña
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Error State (Critical) ---
    if (error && !visitaInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-red-500"></div>
                    <div className="p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 mb-6">
                            <svg className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Algo salió mal</h2>
                        <p className="text-slate-500 mb-8">{error}</p>
                        <button
                            onClick={() => window.close()}
                            className="w-full inline-flex justify-center items-center px-6 py-3 border border-slate-200 text-sm font-medium rounded-xl shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all duration-200"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Layout ---
    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-slate-900 selection:text-white">
            <div className="max-w-3xl w-full space-y-8">

                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                        Feedback de Servicio
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-500">
                        Ayúdanos a mantener los estándares de calidad de Megatlon.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                    {/* Visit Info Grid */}
                    <div className="bg-slate-50/50 border-b border-slate-100 p-6 sm:p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <InfoItem
                                label="SEDE"
                                value={visitaInfo.sede}
                                icon={
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                }
                            />
                            <InfoItem
                                label="TÉCNICO"
                                value={visitaInfo.tecnico}
                                icon={
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                }
                            />
                            <InfoItem
                                label="FECHA"
                                value={new Date(visitaInfo.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                icon={
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                }
                            />
                            <InfoItem
                                label="ESTADO"
                                value={visitaInfo.diasRestantes > 0 ? `${visitaInfo.diasRestantes} días restantes` : 'Cierra hoy'}
                                accent={visitaInfo.diasRestantes <= 1}
                                warning={visitaInfo.diasRestantes <= 1}
                                icon={
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                }
                            />
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="p-6 sm:p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3">
                                    <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nombre completo
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        required
                                        disabled={submitting}
                                        className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 sm:text-sm transition-all shadow-sm outline-none"
                                        placeholder="Ej: Juan Pérez"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="comentarios" className="block text-sm font-semibold text-slate-700 mb-2">
                                        Comentarios sobre la visita
                                    </label>
                                    <textarea
                                        id="comentarios"
                                        name="comentarios"
                                        rows={5}
                                        required
                                        disabled={submitting}
                                        className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 px-4 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 sm:text-sm transition-all shadow-sm resize-none outline-none"
                                        placeholder="Describe brevemente cómo fue el servicio técnico..."
                                        value={formData.comentarios}
                                        onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                                    />
                                    <p className="mt-2 text-right text-[11px] font-medium text-slate-400">
                                        {formData.comentarios.length} caracteres
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="relative w-full inline-flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg shadow-slate-900/10 text-base font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-wait transition-all duration-200 overflow-hidden group"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Enviando feedback...
                                        </>
                                    ) : (
                                        <span className="flex items-center gap-2 group-hover:gap-3 transition-all">
                                            Enviar Comentarios
                                            <svg className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                                <p className="mt-4 text-center text-xs text-slate-400">
                                    Este feedback es confidencial y será revisado por Gerencia de Infraestructura.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-400">
                    <p>&copy; {new Date().getFullYear()} Megatlon Infraestructura</p>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function InfoItem({ label, value, icon, warning = false }) {
    return (
        <div className="flex flex-col gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${warning ? 'bg-amber-50 text-amber-600' : 'bg-white border border-slate-100 text-slate-400 shadow-sm'}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                </svg>
            </div>
            <div>
                <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
                    {label}
                </dt>
                <dd className={`text-sm font-semibold ${warning ? 'text-amber-600' : 'text-slate-900'} break-words`}>
                    {value}
                </dd>
            </div>
        </div>
    );
}
