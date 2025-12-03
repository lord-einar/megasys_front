import React, { useState, useEffect } from 'react';
import { visitasAPI } from '../../services/api';
import LoadingOverlay from '../LoadingOverlay';

const ModalDetalleVisita = ({ visitaId, onClose, onEdit, onCompletar }) => {
    const [visita, setVisita] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDetalle();
    }, [visitaId]);

    const cargarDetalle = async () => {
        try {
            const response = await visitasAPI.getById(visitaId);
            setVisita(response.data);
        } catch (err) {
            setError('Error cargando detalle de la visita');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingOverlay message="Cargando detalle..." />;
    if (!visita) return null;

    const getEstadoBadge = (estado) => {
        const colors = {
            programada: 'bg-blue-100 text-blue-800',
            recordatorio_enviado: 'bg-yellow-100 text-yellow-800',
            realizada: 'bg-green-100 text-green-800',
            cancelada: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[estado] || 'bg-gray-100'}`}>
                {estado.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full m-4 max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-start p-6 border-b">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {visita.sedePrincipal?.nombre_sede}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date(visita.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="text-3xl">&times;</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info Principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Técnico Asignado</h4>
                            <p className="mt-1 text-lg text-gray-900">
                                {visita.tecnicoAsignado?.nombre} {visita.tecnicoAsignado?.apellido}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                            <div className="mt-1">{getEstadoBadge(visita.estado)}</div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Tipo</h4>
                            <p className="mt-1 text-gray-900 capitalize">{visita.tipo}</p>
                        </div>
                        {visita.es_recurrente && (
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Recurrencia</h4>
                                <p className="mt-1 text-blue-600">🔄 Visita Recurrente</p>
                            </div>
                        )}
                    </div>

                    {/* Motivo y Observaciones */}
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700">Motivo</h4>
                        <p className="mt-1 text-gray-600">{visita.motivo || 'Sin motivo especificado'}</p>

                        {visita.observaciones && (
                            <>
                                <h4 className="text-sm font-medium text-gray-700 mt-4">Observaciones</h4>
                                <p className="mt-1 text-gray-600">{visita.observaciones}</p>
                            </>
                        )}
                    </div>

                    {/* Tickets */}
                    {visita.casos_tickets && visita.casos_tickets.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Casos / Tickets Relacionados</h4>
                            <div className="flex flex-wrap gap-2">
                                {visita.casos_tickets.map((ticket, i) => (
                                    <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded border border-blue-200 text-sm">
                                        {ticket}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Solicitudes Previas */}
                    {visita.solicitudesPrevias && visita.solicitudesPrevias.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Solicitudes Pre-Visita</h4>
                            <div className="space-y-2">
                                {visita.solicitudesPrevias.map(sol => (
                                    <div key={sol.id} className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-yellow-800">{sol.solicitante_nombre}</span>
                                            <span className="text-xs text-yellow-600">{new Date(sol.fecha_solicitud).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-yellow-900 mt-1">{sol.descripcion}</p>
                                        {sol.resuelta && (
                                            <span className="inline-block mt-2 text-xs font-bold text-green-600">✓ Resuelta</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Informe Post-Visita (si existe) */}
                    {visita.informe && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Informe de Visita</h3>

                            <div className="space-y-4">
                                {/* Checklist */}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Checklist</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {visita.informe.checklist_items.map((item, i) => (
                                            <div key={i} className="flex items-center text-sm">
                                                <span className={`mr-2 ${item.completado ? 'text-green-500' : 'text-red-500'}`}>
                                                    {item.completado ? '✅' : '❌'}
                                                </span>
                                                <span className={item.completado ? 'text-gray-900' : 'text-gray-500'}>
                                                    {item.nombre}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Problemas Resueltos */}
                                {visita.informe.problemasResueltos && visita.informe.problemasResueltos.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Problemas Resueltos</h4>
                                        <ul className="space-y-2">
                                            {visita.informe.problemasResueltos.map((prob, i) => (
                                                <li key={i} className="bg-gray-50 p-2 rounded text-sm border">
                                                    <p className="font-medium">{prob.descripcion}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                                            {prob.categoria}
                                                        </span>
                                                        {prob.causado_por_usuario && (
                                                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">
                                                                Causado por usuario
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    {visita.estado !== 'realizada' && visita.estado !== 'cancelada' && (
                        <>
                            <button
                                onClick={() => onEdit(visita)}
                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => onCompletar(visita)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
                            >
                                Completar Informe
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleVisita;
