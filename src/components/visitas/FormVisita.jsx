import React, { useState, useEffect } from 'react';
import { visitasAPI, personalAPI, sedesAPI } from '../../services/api';
import LoadingOverlay from '../LoadingOverlay';

const FormVisita = ({ onClose, onSave, visitaEditar = null, fechaPreseleccionada = null }) => {
    const [formData, setFormData] = useState({
        sede_id: '',
        tecnico_asignado_id: '',
        fecha: fechaPreseleccionada ? fechaPreseleccionada.toISOString().split('T')[0] : '',
        tipo: 'programada',
        motivo: '',
        casos_tickets: [],
        es_recurrente: false,
        observaciones: ''
    });

    const [sedes, setSedes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ticketInput, setTicketInput] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarDatos();
        if (visitaEditar) {
            setFormData({
                sede_id: visitaEditar.sede_id,
                tecnico_asignado_id: visitaEditar.tecnico_asignado_id,
                fecha: visitaEditar.fecha,
                tipo: visitaEditar.tipo,
                motivo: visitaEditar.motivo || '',
                casos_tickets: visitaEditar.casos_tickets || [],
                es_recurrente: visitaEditar.es_recurrente || false,
                observaciones: visitaEditar.observaciones || ''
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

            console.log('📊 Técnicos response:', tecnicosRes);
            console.log('📊 Técnicos data:', tecnicosRes.data);

            // Mostrar los roles de cada persona para debug
            if (tecnicosRes.data) {
                tecnicosRes.data.forEach(p => {
                    console.log(`👤 ${p.nombre} ${p.apellido} - Rol nombre: "${p.rol?.nombre}" - Rol completo:`, p.rol);
                });
            }

            // Filtrar solo personal con rol 'Soporte Técnico' o 'Sistemas'
            const tecnicosSoporte = (tecnicosRes.data || []).filter(p =>
                p.rol?.nombre === 'Soporte Técnico' || p.rol?.nombre === 'Sistemas'
            );
            console.log('✅ Técnicos filtrados:', tecnicosSoporte);

            // Si no hay técnicos filtrados, mostrar todos temporalmente para debug
            if (tecnicosSoporte.length === 0) {
                console.warn('⚠️ No se encontraron técnicos con rol "Soporte Técnico" o "Sistemas". Mostrando todos los usuarios temporalmente.');
                setTecnicos(tecnicosRes.data || []);
            } else {
                setTecnicos(tecnicosSoporte);
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
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

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
                {loading && <LoadingOverlay message="Guardando..." />}

                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {visitaEditar ? 'Editar Visita' : 'Nueva Visita'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sede</label>
                            <select
                                name="sede_id"
                                value={formData.sede_id}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                            >
                                <option value="">Seleccionar Sede</option>
                                {sedes.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre_sede}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Técnico</label>
                            <select
                                name="tecnico_asignado_id"
                                value={formData.tecnico_asignado_id}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                            >
                                <option value="">Seleccionar Técnico</option>
                                {tecnicos.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 bg-white"
                            >
                                <option value="programada">Programada</option>
                                <option value="urgencia">Urgencia</option>
                                <option value="solicitud">Solicitud</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Motivo</label>
                        <textarea
                            name="motivo"
                            value={formData.motivo}
                            onChange={handleChange}
                            rows="2"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Casos / Tickets</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={ticketInput}
                                onChange={(e) => setTicketInput(e.target.value)}
                                placeholder="Ej: CRM-1234"
                                className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            <button
                                type="button"
                                onClick={handleAddTicket}
                                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                Agregar
                            </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {formData.casos_tickets.map((ticket, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                                    {ticket}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTicket(index)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {!visitaEditar && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="es_recurrente"
                                checked={formData.es_recurrente}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Es visita recurrente (Quincenal por 3 meses)
                            </label>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            rows="2"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                        >
                            {visitaEditar ? 'Guardar Cambios' : 'Crear Visita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormVisita;
