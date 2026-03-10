import React from 'react';
import { visitasAPI, visitaImagenesAPI } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';

const ModalDetalleVisita = ({ visitaId, onClose, onEdit, onCompletar, onEditarInforme }) => {
    const [visita, setVisita] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [imagenes, setImagenes] = React.useState([]);
    const [imagenLightbox, setImagenLightbox] = React.useState(null);
    const { hasPermission } = usePermissions();

    React.useEffect(() => {
        if (visitaId) {
            cargarVisita();
        }
    }, [visitaId]);

    const cargarVisita = async () => {
        try {
            const response = await visitasAPI.getById(visitaId);
            setVisita(response.data);
            setImagenes(response.data?.informe?.imagenes || []);
        } catch (error) {
            console.error('Error cargando visita:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarImagen = async (imagenId) => {
        if (!window.confirm('¿Eliminar esta imagen?')) return;
        try {
            await visitaImagenesAPI.delete(visitaId, imagenId);
            setImagenes(prev => prev.filter(img => img.id !== imagenId));
        } catch (error) {
            alert('Error al eliminar la imagen: ' + (error.message || 'Error desconocido'));
        }
    };

    if (!visita) return null;

    const getEstadoBadge = (estado) => {
        const config = {
            programada: {
                style: 'bg-blue-100 text-blue-800 border-blue-200',
                label: 'Programada'
            },
            recordatorio_enviado: {
                style: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                label: 'Recordatorio Enviado'
            },
            realizada: {
                style: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                label: 'Realizada'
            },
            cancelada: {
                style: 'bg-slate-100 text-slate-800 border-slate-200',
                label: 'Cancelada'
            }
        };
        const item = config[estado] || { style: 'bg-gray-100 text-gray-800', label: estado };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${item.style}`}>
                {item.label}
            </span>
        );
    };

    const handleEnviarAviso = async () => {
        setLoading(true);
        try {
            await visitasAPI.enviarAviso(visita.id);
            // Usar alert simple o Swal si estuviera importado. Como no está importado Swal en este archivo, usaré alert.
            // O mejor, importar Swal si es posible. Veo que no está importado.
            // Para mantener consistencia, agregaré import Swal al principio si no está.
            // Pero replace_file_content es local. Usaré alert por ahora o window.confirm para feedback.
            alert('Aviso enviado correctamente a los destinatarios.');
        } catch (error) {
            console.error('Error enviando aviso:', error);
            alert('Error al enviar el aviso: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start px-6 py-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-slate-900">Detalle de Visita</h3>
                            {getEstadoBadge(visita.estado)}
                            {visita.tipo === 'urgencia' && (
                                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded animate-pulse">
                                    URGENTE
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(visita.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sede</p>
                            <p className="text-lg font-medium text-slate-900">{visita.sedePrincipal?.nombre_sede || 'Sede no especificada'}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Técnico Asignado</p>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                    {visita.tecnicoAsignado?.nombre?.charAt(0) || 'T'}
                                </div>
                                <p className="text-lg font-medium text-slate-900">
                                    {visita.tecnicoAsignado ? `${visita.tecnicoAsignado.nombre} ${visita.tecnicoAsignado.apellido}` : 'Sin asignar'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Motivo */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Motivo
                        </h4>
                        <p className="text-slate-600 bg-white p-3 border border-slate-200 rounded-lg text-sm leading-relaxed">
                            {visita.motivo || (visita.es_recurrente ? 'Visita periódica preventiva' : 'Sin motivo especificado')}
                        </p>
                    </div>

                    {/* Tickets */}
                    {visita.casos_tickets && visita.casos_tickets.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Tickets Relacionados
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {visita.casos_tickets.map((ticket, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
                                        {ticket}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Informe (si existe) */}
                    {visita.informe && (
                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Informe de Visita
                                {visita.informe.veces_editado > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">
                                        EDITADO {visita.informe.veces_editado > 1 ? `(${visita.informe.veces_editado}x)` : ''}
                                    </span>
                                )}
                            </h4>

                            {/* Banner de Edición - Solo visible para Infraestructura */}
                            {visita.informe.veces_editado > 0 && hasPermission('visitas', 'delete') && visita.informe.editor && (
                                <div className="mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div className="flex-1">
                                            <h5 className="text-sm font-bold text-yellow-900 mb-1">
                                                ⚠️ Informe Editado {visita.informe.veces_editado > 1 ? `(${visita.informe.veces_editado} veces)` : ''}
                                            </h5>
                                            <div className="text-xs text-yellow-800 space-y-1">
                                                <p>
                                                    <span className="font-semibold">Última edición por:</span> {visita.informe.editor.nombre} {visita.informe.editor.apellido}
                                                </p>
                                                <p>
                                                    <span className="font-semibold">Fecha:</span>{' '}
                                                    {new Date(visita.informe.fecha_ultima_edicion).toLocaleString('es-AR')}
                                                </p>
                                                {visita.informe.historial_cambios && visita.informe.historial_cambios.length > 0 && (
                                                    <>
                                                        <div className="mt-3 bg-amber-100 border border-amber-200 rounded p-2">
                                                            <p className="font-semibold text-amber-900 mb-1">Cambios realizados:</p>
                                                            <p className="text-amber-800">{visita.informe.historial_cambios[visita.informe.historial_cambios.length - 1].resumen}</p>
                                                        </div>
                                                        {visita.informe.veces_editado > 1 && (
                                                            <details className="mt-2">
                                                                <summary className="cursor-pointer text-yellow-700 font-semibold hover:text-yellow-900">
                                                                    Ver historial completo ({visita.informe.veces_editado} ediciones)
                                                                </summary>
                                                                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                                                    {visita.informe.historial_cambios.slice().reverse().map((cambio, idx) => (
                                                                        <div key={idx} className="bg-white border border-yellow-200 rounded p-2 text-xs">
                                                                            <p className="font-semibold text-yellow-900">
                                                                                {new Date(cambio.fecha).toLocaleString('es-AR')} - {cambio.usuario_nombre}
                                                                            </p>
                                                                            <p className="text-yellow-800 mt-1">{cambio.resumen}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </details>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-xs text-yellow-700 mt-2 italic">
                                                Esta información es visible solo para el equipo de Infraestructura.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Checklist de Control */}
                            {visita.informe.checklist_items && visita.informe.checklist_items.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                                    <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        Checklist de Control
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {visita.informe.checklist_items.map((item, i) => (
                                            <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded ${item.completado ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                {item.completado ? (
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                                <span>{item.nombre}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items Adicionales del Checklist */}
                            {visita.informe.checklist_extra && visita.informe.checklist_extra.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <h5 className="text-sm font-bold text-blue-800 mb-2">Items Adicionales</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {visita.informe.checklist_extra.map((item, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                {item.nombre}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Problemas Resueltos */}
                            {visita.informe.problemasResueltos && visita.informe.problemasResueltos.length > 0 && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-4">
                                    <h5 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Problemas Resueltos ({visita.informe.problemasResueltos.length})
                                    </h5>
                                    <div className="space-y-2">
                                        {visita.informe.problemasResueltos.map((p, i) => (
                                            <div key={i} className="bg-white border border-emerald-200 rounded-lg p-3">
                                                <p className="text-sm text-slate-800 mb-2">{p.descripcion}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span
                                                        className="px-2 py-0.5 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: p.categoriaProblema?.color ? `${p.categoriaProblema.color}20` : '#e5e7eb',
                                                            color: p.categoriaProblema?.color || '#374151'
                                                        }}
                                                    >
                                                        {p.categoriaProblema?.nombre || 'Sin categoría'}
                                                    </span>
                                                    {p.causado_por_usuario && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                                            Causado por usuario
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Casos/Tickets Cerrados */}
                            {visita.informe.casos_resueltos && visita.informe.casos_resueltos.length > 0 && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                                    <h5 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Casos/Tickets Cerrados ({visita.informe.casos_resueltos.length})
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {visita.informe.casos_resueltos.map((caso, i) => (
                                            <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                                {caso}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Observaciones Finales */}
                            {visita.informe.observaciones && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                                    <h5 className="text-sm font-bold text-slate-700 mb-2">Observaciones Finales</h5>
                                    <p className="text-sm text-slate-600 italic leading-relaxed">
                                        "{visita.informe.observaciones}"
                                    </p>
                                </div>
                            )}

                            {/* Comentarios del Responsable de Sede */}
                            {visita.informe.comentarios_responsable_sede && (
                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg p-5 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-2">
                                                Comentarios del Responsable de Sede
                                                {visita.informe.comentarios_responsable_fecha && (
                                                    <span className="text-xs font-normal text-amber-600">
                                                        ({new Date(visita.informe.comentarios_responsable_fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})
                                                    </span>
                                                )}
                                            </h5>
                                            <p className="text-sm text-amber-900 leading-relaxed mb-2 italic">
                                                "{visita.informe.comentarios_responsable_sede}"
                                            </p>
                                            {visita.informe.comentarios_responsable_nombre && (
                                                <p className="text-xs text-amber-700 font-medium">
                                                    — {visita.informe.comentarios_responsable_nombre}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Imágenes */}
                            <div className="mt-4 border-t border-slate-100 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Imágenes
                                        {imagenes.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{imagenes.length}</span>
                                        )}
                                    </h5>
                                </div>
                                {imagenes.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Sin imágenes adjuntas.</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {imagenes.map((img) => (
                                            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                                                <img
                                                    src={img.url}
                                                    alt={img.nombre_original || 'Imagen'}
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => setImagenLightbox(img)}
                                                />
                                                {hasPermission('visitas', 'completar_informe') && (
                                                    <button
                                                        onClick={() => handleEliminarImagen(img.id)}
                                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex hover:bg-red-600"
                                                        title="Eliminar imagen"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Lightbox */}
                    {imagenLightbox && (
                        <div
                            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
                            onClick={() => setImagenLightbox(null)}
                        >
                            <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => setImagenLightbox(null)}
                                    className="absolute -top-10 right-0 text-white/80 hover:text-white text-2xl font-bold"
                                >
                                    ×
                                </button>
                                <img
                                    src={imagenLightbox.url}
                                    alt={imagenLightbox.nombre_original || 'Imagen'}
                                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                                />
                                {imagenLightbox.nombre_original && (
                                    <p className="text-white/60 text-xs text-center mt-2">{imagenLightbox.nombre_original}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-slate-50 rounded-b-xl border-t border-slate-100 flex justify-end gap-3">
                    {(visita.estado === 'programada' || visita.estado === 'recordatorio_enviado') && (
                        <>
                            <button
                                onClick={handleEnviarAviso}
                                disabled={!hasPermission('visitas', 'enviar_aviso')}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${
                                    hasPermission('visitas', 'enviar_aviso')
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 cursor-pointer'
                                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                                title={!hasPermission('visitas', 'enviar_aviso') ? 'No tienes permiso para enviar avisos' : ''}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Reenviar Aviso
                            </button>
                            <button
                                onClick={() => onEdit(visita)}
                                disabled={!hasPermission('visitas', 'update')}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm ${
                                    hasPermission('visitas', 'update')
                                        ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                                title={!hasPermission('visitas', 'update') ? 'No tienes permiso para editar visitas' : ''}
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => onCompletar(visita)}
                                disabled={!hasPermission('visitas', 'completar_informe')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${
                                    hasPermission('visitas', 'completar_informe')
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                                title={!hasPermission('visitas', 'completar_informe') ? 'No tienes permiso para completar informes' : ''}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Completar Informe
                            </button>
                        </>
                    )}

                    {/* Botón Editar Informe para visitas realizadas */}
                    {visita.estado === 'realizada' && visita.informe && onEditarInforme && (
                        <button
                            onClick={() => onEditarInforme(visita)}
                            disabled={!hasPermission('visitas', 'completar_informe')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${
                                hasPermission('visitas', 'completar_informe')
                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer'
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                            title={!hasPermission('visitas', 'completar_informe') ? 'No tienes permiso para editar informes' : 'Editar el informe de esta visita realizada'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar Informe
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalleVisita;
