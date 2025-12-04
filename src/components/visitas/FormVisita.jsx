import { useState, useEffect } from 'react';
import { visitasAPI, sedesAPI, personalAPI } from '../../services/api';
import LoadingOverlay from '../LoadingOverlay';
import logger from '../../utils/logger';
import Swal from 'sweetalert2';

const FormVisita = ({ onClose, onSave, visitaEditar = null, fechaPreseleccionada = null }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sedes, setSedes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [ticketInput, setTicketInput] = useState('');

    // Función helper para convertir Date a formato yyyy-MM-dd
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        if (typeof fecha === 'string') return fecha.split('T')[0];
        if (fecha instanceof Date) {
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return '';
    };

    const [formData, setFormData] = useState({
        sede_id: '',
        tecnico_asignado_id: '',
        fecha: formatearFecha(fechaPreseleccionada),
        motivo: '',
        tipo: 'programada',
        observaciones: '',
        casos_tickets: [],
        es_recurrente: false
    });

    useEffect(() => {
        cargarDatos();
        if (visitaEditar) {
            setFormData({
                sede_id: visitaEditar.sedePrincipal?.id || visitaEditar.sede_id || '',
                tecnico_asignado_id: visitaEditar.tecnicoAsignado?.id || visitaEditar.tecnico_asignado_id || '',
                fecha: formatearFecha(visitaEditar.fecha),
                motivo: visitaEditar.motivo || '',
                tipo: visitaEditar.tipo || 'programada',
                observaciones: visitaEditar.observaciones || '',
                casos_tickets: visitaEditar.casos_tickets || [],
                es_recurrente: visitaEditar.es_recurrente || false
            });
        }
    }, [visitaEditar]);

    const cargarDatos = async () => {
        try {
            const [sedesRes, tecnicosRes] = await Promise.all([
                sedesAPI.list({ limit: 100 }), // Obtener todas las sedes disponibles
                personalAPI.list({ limit: 100 }) // Obtener usuarios con límite máximo permitido
            ]);
            setSedes(sedesRes.data || []);

            logger.debug('📊 Técnicos response:', tecnicosRes);
            logger.debug('📊 Técnicos data:', tecnicosRes.data);

            // Mostrar los roles de cada persona para debug
            if (tecnicosRes.data) {
                tecnicosRes.data.forEach(p => {
                    logger.debug(`👤 ${p.nombre} ${p.apellido} - Rol nombre: "${p.rol?.nombre}" - Rol completo:`, p.rol);
                });
            }

            // Filtrar solo personal con rol 'Soporte Técnico' o 'Sistemas'
            const tecnicosSoporte = (tecnicosRes.data || []).filter(p =>
                p.rol?.nombre === 'Soporte Técnico' || p.rol?.nombre === 'Sistemas'
            );
            logger.debug('✅ Técnicos filtrados:', tecnicosSoporte);

            // Si no hay técnicos filtrados, mostrar todos temporalmente para debug
            if (tecnicosSoporte.length === 0) {
                logger.warn('⚠️ No se encontraron técnicos con rol "Soporte Técnico" o "Sistemas". Mostrando todos los usuarios temporalmente.');
                setTecnicos(tecnicosRes.data || []);
            } else {
                setTecnicos(tecnicosSoporte);
            }
        } catch (err) {
            logger.error('Error cargando datos:', err);
            setError('Error cargando listas de sedes o técnicos');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddTicket = (e) => {
        e.preventDefault();
        if (ticketInput.trim()) {
            setFormData(prev => ({
                ...prev,
                casos_tickets: [...prev.casos_tickets, ticketInput.trim()]
            }));
            setTicketInput('');
        }
    };

    const handleRemoveTicket = (index) => {
        setFormData(prev => ({
            ...prev,
            casos_tickets: prev.casos_tickets.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (visitaEditar) {
                // Preguntar si actualizar serie si es recurrente (simple confirm por ahora)
                let actualizarSerie = false;
                if (visitaEditar.es_recurrente) {
                    actualizarSerie = window.confirm('¿Deseas aplicar los cambios a todas las visitas futuras de esta serie?');
                }
                await visitasAPI.update(visitaEditar.id, formData, actualizarSerie);
            } else {
                await visitasAPI.create(formData);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error guardando la visita');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        let eliminarSerie = false;

        if (visitaEditar.es_recurrente) {
            const result = await Swal.fire({
                title: 'Eliminar Visita Recurrente',
                text: 'Esta visita es parte de una serie. ¿Qué deseas eliminar?',
                icon: 'warning',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Solo esta visita',
                denyButtonText: 'Toda la serie futura',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#3085d6',
                denyButtonColor: '#d33'
            });

            if (result.isDismissed) return;
            if (result.isDenied) eliminarSerie = true;
        } else {
            const result = await Swal.fire({
                title: '¿Eliminar visita?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (!result.isConfirmed) return;
        }

        setLoading(true);
        try {
            await visitasAPI.delete(visitaEditar.id, eliminarSerie);
            await Swal.fire('Eliminada', 'La visita ha sido eliminada correctamente', 'success');
            onSave(); // Recargar calendario
            onClose();
        } catch (err) {
            setError(err.message || 'Error eliminando la visita');
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        const { value: motivo } = await Swal.fire({
            title: 'Cancelar Visita',
            input: 'text',
            inputLabel: 'Motivo de la cancelación',
            inputPlaceholder: 'Ingrese el motivo...',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Cancelación',
            cancelButtonText: 'Volver',
            confirmButtonColor: '#f59e0b',
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes ingresar un motivo para cancelar';
                }
            }
        });

        if (!motivo) return;

        setLoading(true);
        try {
            await visitasAPI.cancelar(visitaEditar.id, { motivo });
            await Swal.fire('Cancelada', 'La visita ha sido marcada como cancelada', 'success');
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error cancelando la visita');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all">
                {loading && <LoadingOverlay message="Procesando..." />}

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {visitaEditar ? 'Editar Visita' : 'Nueva Visita'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Complete los detalles de la visita técnica</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700">Sede</label>
                            <select
                                name="sede_id"
                                value={formData.sede_id}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                            >
                                <option value="">Seleccionar Sede</option>
                                {sedes.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre_sede}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700">Técnico Asignado</label>
                            <select
                                name="tecnico_asignado_id"
                                value={formData.tecnico_asignado_id}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                            >
                                <option value="">Seleccionar Técnico</option>
                                {tecnicos.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700">Fecha Programada</label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-slate-700">Tipo de Visita</label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                            >
                                <option value="programada">Programada</option>
                                <option value="urgencia">Urgencia</option>
                                <option value="solicitud">Solicitud</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-slate-700">Motivo de la Visita</label>
                        <textarea
                            name="motivo"
                            value={formData.motivo}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Describa brevemente el motivo..."
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-slate-700">Casos / Tickets Relacionados</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={ticketInput}
                                onChange={(e) => setTicketInput(e.target.value)}
                                placeholder="Ej: CRM-1234"
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTicket(e)}
                            />
                            <button
                                type="button"
                                onClick={handleAddTicket}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Agregar
                            </button>
                        </div>
                        {formData.casos_tickets.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {formData.casos_tickets.map((ticket, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                        {ticket}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTicket(index)}
                                            className="ml-1.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {!visitaEditar && (
                        <div className="relative flex items-start p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                            <div className="flex items-center h-5">
                                <input
                                    id="es_recurrente"
                                    name="es_recurrente"
                                    type="checkbox"
                                    checked={formData.es_recurrente}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="es_recurrente" className="font-medium text-slate-700">Visita Recurrente</label>
                                <p className="text-slate-500">Se generarán visitas quincenales automáticamente por los próximos 3 meses.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-slate-700">Observaciones Adicionales</label>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            rows="3"
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-between pt-6 border-t border-slate-100">
                        <div className="flex gap-2">
                            {visitaEditar && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-amber-300 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                                    >
                                        Cancelar Visita
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                {visitaEditar ? 'Guardar Cambios' : 'Crear Visita'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormVisita;
