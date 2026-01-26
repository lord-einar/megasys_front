import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ModalVisitasDelDia = ({ fecha, visitas, onClose, onSelectVisita }) => {
    if (!fecha || !visitas) return null;

    const fechaFormateada = format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

    // Función para obtener el badge de estado
    const getEstadoBadge = (estado) => {
        const badges = {
            programada: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Programada' },
            recordatorio_enviado: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Recordatorio Enviado' },
            realizada: { bg: 'bg-green-100', text: 'text-green-700', label: 'Realizada' },
            cancelada: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelada' },
        };
        const badge = badges[estado] || badges.programada;
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    // Función para obtener el badge de tipo
    const getTipoBadge = (tipo) => {
        if (tipo === 'urgencia') {
            return (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                    🚨 Urgencia
                </span>
            );
        }
        return null;
    };

    const handleVisitaClick = (visita) => {
        onSelectVisita(visita);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-primary-50 to-primary-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-navy-900 capitalize">
                                {fechaFormateada}
                            </h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {visitas.length} {visitas.length === 1 ? 'visita programada' : 'visitas programadas'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-white/50 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Grid de Cards de Visitas */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visitas.map((visita) => {
                            const sede = visita.extendedProps?.sedeNombre || 'Sede no especificada';
                            const tecnico = visita.title?.split(' - ')[1] || 'Técnico';

                            return (
                                <div
                                    key={visita.id}
                                    onClick={() => handleVisitaClick(visita)}
                                    className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                                >
                                    {/* Header con color del técnico */}
                                    <div
                                        className="h-2"
                                        style={{ backgroundColor: visita.backgroundColor || '#3b82f6' }}
                                    />

                                    <div className="p-4">
                                        {/* Badges superiores */}
                                        <div className="flex items-center justify-between mb-3">
                                            {getEstadoBadge(visita.extendedProps?.estado)}
                                            {getTipoBadge(visita.extendedProps?.tipo)}
                                        </div>

                                        {/* Sede */}
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="uppercase tracking-wide font-semibold">Sede</span>
                                            </div>
                                            <h3 className="font-bold text-navy-900 text-lg group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {sede}
                                            </h3>
                                        </div>

                                        {/* Técnico */}
                                        <div className="flex items-center gap-2 text-sm text-slate-600 pt-3 border-t border-slate-100">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                                                style={{ backgroundColor: visita.backgroundColor || '#3b82f6' }}
                                            >
                                                {tecnico.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-500 font-medium">Técnico asignado</p>
                                                <p className="font-semibold text-slate-700 truncate">{tecnico}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Indicador hover */}
                                    <div className="h-0 group-hover:h-1 bg-primary-500 transition-all duration-200" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
                    <div className="flex justify-between items-center text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Haz clic en una visita para ver sus detalles
                        </p>
                        <button
                            onClick={onClose}
                            className="btn-secondary text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalVisitasDelDia;
