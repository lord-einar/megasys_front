import React, { useState, useEffect } from 'react';
import { visitasAPI } from '../../services/api';
import LoadingOverlay from '../LoadingOverlay';

const FormInformeVisita = ({ visita, onClose, onSave }) => {
    const [checklistItems, setChecklistItems] = useState([]);
    const [checklistExtra, setChecklistExtra] = useState([]);
    const [casosResueltos, setCasosResueltos] = useState([]);
    const [problemasResueltos, setProblemasResueltos] = useState([]);
    const [solicitudesResueltas, setSolicitudesResueltas] = useState([]);
    const [observaciones, setObservaciones] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Inputs temporales
    const [extraInput, setExtraInput] = useState('');
    const [casoInput, setCasoInput] = useState('');
    const [problemaInput, setProblemaInput] = useState({
        descripcion: '',
        categoria: 'otro',
        causado_por_usuario: false
    });

    useEffect(() => {
        cargarChecklistBase();
    }, []);

    const cargarChecklistBase = async () => {
        try {
            const response = await visitasAPI.getChecklistItems();
            if (response.data) {
                setChecklistItems(response.data.map(item => ({
                    ...item,
                    completado: false
                })));
            }
        } catch (err) {
            console.error('Error cargando checklist:', err);
        }
    };

    const handleChecklistChange = (index) => {
        const newItems = [...checklistItems];
        newItems[index].completado = !newItems[index].completado;
        setChecklistItems(newItems);
    };

    const handleAddExtra = () => {
        if (extraInput.trim()) {
            setChecklistExtra([...checklistExtra, { nombre: extraInput, completado: true }]);
            setExtraInput('');
        }
    };

    const handleAddCaso = () => {
        if (casoInput.trim()) {
            setCasosResueltos([...casosResueltos, casoInput.trim()]);
            setCasoInput('');
        }
    };

    const handleAddProblema = () => {
        if (problemaInput.descripcion.trim()) {
            setProblemasResueltos([...problemasResueltos, { ...problemaInput }]);
            setProblemaInput({ descripcion: '', categoria: 'otro', causado_por_usuario: false });
        }
    };

    const handleSolicitudToggle = (id) => {
        if (solicitudesResueltas.includes(id)) {
            setSolicitudesResueltas(solicitudesResueltas.filter(sid => sid !== id));
        } else {
            setSolicitudesResueltas([...solicitudesResueltas, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que al menos un item del checklist esté marcado
        if (!checklistItems.some(i => i.completado) && checklistExtra.length === 0) {
            setError('Debes marcar al menos un item del checklist.');
            return;
        }

        if (!window.confirm('Se enviará la minuta a Infraestructura y a la Sede. ¿Confirmas que la visita está terminada?')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                checklist_items: checklistItems.map(i => ({ nombre: i.nombre, completado: i.completado })),
                checklist_extra: checklistExtra,
                casos_resueltos: casosResueltos,
                problemas_resueltos: problemasResueltos,
                solicitudes_resueltas: solicitudesResueltas,
                observaciones
            };

            await visitasAPI.marcarRealizada(visita.id, payload);
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error guardando el informe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
                {loading && <LoadingOverlay message="Guardando informe y enviando minuta..." />}

                <div className="flex justify-between items-center p-6 border-b bg-green-50">
                    <div>
                        <h3 className="text-xl font-bold text-green-800">Completar Informe de Visita</h3>
                        <p className="text-sm text-green-600">{visita.sedePrincipal?.nombre} - {new Date(visita.fecha).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* 1. Checklist */}
                    <section>
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">1. Checklist de Control</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {checklistItems.map((item, index) => (
                                <label key={index} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.completado}
                                        onChange={() => handleChecklistChange(index)}
                                        className="h-5 w-5 text-green-600 mt-0.5"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">{item.nombre}</span>
                                        {item.descripcion && <p className="text-xs text-gray-500">{item.descripcion}</p>}
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700">Agregar item adicional</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    value={extraInput}
                                    onChange={(e) => setExtraInput(e.target.value)}
                                    placeholder="Ej: Revisión de cableado extra"
                                    className="flex-1 border p-2 rounded"
                                />
                                <button type="button" onClick={handleAddExtra} className="bg-gray-200 px-4 py-2 rounded">Agregar</button>
                            </div>
                            <div className="mt-2 space-y-1">
                                {checklistExtra.map((item, i) => (
                                    <div key={i} className="flex items-center text-sm text-green-700 bg-green-50 px-2 py-1 rounded w-fit">
                                        ✓ {item.nombre} (Adicional)
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 2. Problemas Resueltos */}
                    <section>
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">2. Problemas Resueltos</h4>
                        <div className="bg-gray-50 p-4 rounded-md space-y-3">
                            <input
                                type="text"
                                value={problemaInput.descripcion}
                                onChange={(e) => setProblemaInput({ ...problemaInput, descripcion: e.target.value })}
                                placeholder="Descripción del problema resuelto"
                                className="w-full border p-2 rounded"
                            />
                            <div className="flex gap-4">
                                <select
                                    value={problemaInput.categoria}
                                    onChange={(e) => setProblemaInput({ ...problemaInput, categoria: e.target.value })}
                                    className="border p-2 rounded flex-1"
                                >
                                    <option value="otro">Otro</option>
                                    <option value="telefonia">Telefonía</option>
                                    <option value="red">Red / Internet</option>
                                    <option value="camaras_seguridad">Cámaras de Seguridad</option>
                                    <option value="grabaciones">Grabaciones (NVR/DVR)</option>
                                </select>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={problemaInput.causado_por_usuario}
                                        onChange={(e) => setProblemaInput({ ...problemaInput, causado_por_usuario: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <span className="text-sm">Causado por usuario</span>
                                </label>
                                <button type="button" onClick={handleAddProblema} className="bg-blue-600 text-white px-4 py-2 rounded">
                                    Agregar
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {problemasResueltos.map((prob, i) => (
                                <div key={i} className="flex justify-between items-center bg-white border p-3 rounded shadow-sm">
                                    <div>
                                        <p className="font-medium">{prob.descripcion}</p>
                                        <div className="flex gap-2 text-xs mt-1">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{prob.categoria}</span>
                                            {prob.causado_por_usuario && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded">Usuario</span>}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setProblemasResueltos(problemasResueltos.filter((_, idx) => idx !== i))}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. Solicitudes Pre-Visita */}
                    {visita.solicitudesPrevias && visita.solicitudesPrevias.length > 0 && (
                        <section>
                            <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">3. Solicitudes Pre-Visita</h4>
                            <div className="space-y-2">
                                {visita.solicitudesPrevias.map(sol => (
                                    <label key={sol.id} className={`flex items-start space-x-3 p-3 border rounded cursor-pointer ${solicitudesResueltas.includes(sol.id) ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                                        <input
                                            type="checkbox"
                                            checked={solicitudesResueltas.includes(sol.id)}
                                            onChange={() => handleSolicitudToggle(sol.id)}
                                            className="h-5 w-5 text-green-600 mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{sol.solicitante_nombre}</span>
                                                <span className="text-xs text-gray-500">{new Date(sol.fecha_solicitud).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{sol.descripcion}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 4. Casos Resueltos */}
                    <section>
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">4. Casos/Tickets Resueltos</h4>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={casoInput}
                                onChange={(e) => setCasoInput(e.target.value)}
                                placeholder="Nro Ticket (ej: CRM-123)"
                                className="border p-2 rounded flex-1"
                            />
                            <button type="button" onClick={handleAddCaso} className="bg-gray-200 px-4 py-2 rounded">Agregar</button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {casosResueltos.map((caso, i) => (
                                <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded flex items-center gap-2">
                                    {caso}
                                    <button type="button" onClick={() => setCasosResueltos(casosResueltos.filter((_, idx) => idx !== i))}>&times;</button>
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* 5. Observaciones */}
                    <section>
                        <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">5. Observaciones Finales</h4>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows="3"
                            className="w-full border p-2 rounded"
                            placeholder="Comentarios generales sobre la visita..."
                        />
                    </section>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-white py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-green-600 py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700"
                        >
                            Finalizar Visita y Enviar Minuta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormInformeVisita;
