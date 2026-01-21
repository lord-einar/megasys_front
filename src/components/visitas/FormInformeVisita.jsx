import React, { useState, useEffect } from 'react';
import { visitasAPI, categoriasProblemasAPI } from '../../services/api';
import LoadingOverlay from '../LoadingOverlay';
import Swal from 'sweetalert2';

const FormInformeVisita = ({ visita, onClose, onSave }) => {
    const [checklistItems, setChecklistItems] = useState([]);
    const [checklistExtra, setChecklistExtra] = useState([]);
    const [casosResueltos, setCasosResueltos] = useState([]);
    const [problemasResueltos, setProblemasResueltos] = useState([]);
    const [solicitudesResueltas, setSolicitudesResueltas] = useState([]);
    const [observaciones, setObservaciones] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categoriasProblemas, setCategoriasProblemas] = useState([]);

    // Inputs temporales
    const [extraInput, setExtraInput] = useState('');
    const [casoInput, setCasoInput] = useState('');
    const [problemaInput, setProblemaInput] = useState({
        descripcion: '',
        categoria_id: '',
        causado_por_usuario: false
    });

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            // Cargar checklist y categorías en paralelo
            const [checklistRes, categoriasRes] = await Promise.all([
                visitasAPI.getChecklistItems(),
                categoriasProblemasAPI.list({ activo: true })
            ]);

            if (checklistRes.data) {
                setChecklistItems(checklistRes.data.map(item => ({
                    ...item,
                    completado: false
                })));
            }

            if (categoriasRes.data) {
                setCategoriasProblemas(categoriasRes.data);
                // Establecer categoría por defecto (la primera ordenada o 'otro')
                const categoriaOtro = categoriasRes.data.find(c => c.codigo === 'otro');
                if (categoriaOtro) {
                    setProblemaInput(prev => ({ ...prev, categoria_id: categoriaOtro.id }));
                } else if (categoriasRes.data.length > 0) {
                    setProblemaInput(prev => ({ ...prev, categoria_id: categoriasRes.data[0].id }));
                }
            }
        } catch (err) {
            console.error('Error cargando datos iniciales:', err);
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
        if (problemaInput.descripcion.trim() && problemaInput.categoria_id) {
            // Encontrar la categoría para guardar también el nombre
            const categoria = categoriasProblemas.find(c => c.id === problemaInput.categoria_id);
            setProblemasResueltos([...problemasResueltos, {
                ...problemaInput,
                categoria_nombre: categoria?.nombre || 'Sin categoría'
            }]);
            // Resetear con la categoría "otro" por defecto
            const categoriaOtro = categoriasProblemas.find(c => c.codigo === 'otro');
            setProblemaInput({
                descripcion: '',
                categoria_id: categoriaOtro?.id || categoriasProblemas[0]?.id || '',
                causado_por_usuario: false
            });
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

        // Verificar si hay items sin completar
        const itemsSinCompletar = checklistItems.filter(i => !i.completado);

        if (itemsSinCompletar.length > 0) {
            // Mostrar advertencia de items sin completar
            const warningResult = await Swal.fire({
                title: '⚠️ Items sin completar',
                html: `
                    <p>Hay <strong>${itemsSinCompletar.length} item(s)</strong> del checklist sin marcar:</p>
                    <ul style="text-align: left; margin: 15px 0; padding-left: 20px;">
                        ${itemsSinCompletar.map(item => `<li>${item.nombre}</li>`).join('')}
                    </ul>
                    <p style="margin-top: 15px;">¿Deseas continuar de todas formas?</p>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f59e0b',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar',
                backdrop: true,
                allowOutsideClick: false
            });

            if (!warningResult.isConfirmed) {
                return;
            }
        }

        const result = await Swal.fire({
            title: '¿Finalizar visita?',
            html: 'Se enviará la minuta a <strong>Infraestructura</strong> y a la <strong>Sede</strong>.<br/><br/>¿Confirmas que la visita está terminada?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, finalizar',
            cancelButtonText: 'Cancelar',
            backdrop: true,
            allowOutsideClick: false
        });

        if (!result.isConfirmed) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                checklist_items: checklistItems.map(i => ({ nombre: i.nombre, completado: i.completado })),
                checklist_extra: checklistExtra,
                casos_resueltos: casosResueltos,
                problemas_resueltos: problemasResueltos.map(p => ({
                    descripcion: p.descripcion,
                    categoria_id: p.categoria_id,
                    causado_por_usuario: p.causado_por_usuario
                })),
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
                {loading && <LoadingOverlay message="Guardando informe y enviando minuta..." />}

                <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 bg-emerald-50/50 rounded-t-xl">
                    <div>
                        <h3 className="text-xl font-bold text-emerald-800">Completar Informe de Visita</h3>
                        <p className="text-sm text-emerald-600">{visita.sedePrincipal?.nombre_sede} - {new Date(visita.fecha).toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Cerrar formulario"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* 1. Checklist */}
                    <section>
                        <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">1. Checklist de Control</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {checklistItems.map((item, index) => (
                                <label key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={item.completado}
                                        onChange={() => handleChecklistChange(index)}
                                        className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-2 focus:ring-emerald-500 mt-0.5"
                                    />
                                    <div>
                                        <span className="font-medium text-slate-900">{item.nombre}</span>
                                        {item.descripcion && <p className="text-xs text-slate-500">{item.descripcion}</p>}
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-medium text-slate-700">Agregar item adicional</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    value={extraInput}
                                    onChange={(e) => setExtraInput(e.target.value)}
                                    placeholder="Ej: Revisión de cableado extra"
                                    className="input flex-1"
                                />
                                <button type="button" onClick={handleAddExtra} className="btn btn-secondary">Agregar</button>
                            </div>
                            <div className="mt-2 space-y-1">
                                {checklistExtra.map((item, i) => (
                                    <div key={i} className="flex items-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg w-fit">
                                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {item.nombre} <span className="text-emerald-600 ml-1">(Adicional)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 2. Problemas Resueltos */}
                    <section>
                        <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">2. Problemas Resueltos</h4>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                            <input
                                type="text"
                                value={problemaInput.descripcion}
                                onChange={(e) => setProblemaInput({ ...problemaInput, descripcion: e.target.value })}
                                placeholder="Descripción del problema resuelto"
                                className="input w-full"
                            />
                            <div className="flex gap-4">
                                <select
                                    value={problemaInput.categoria_id}
                                    onChange={(e) => setProblemaInput({ ...problemaInput, categoria_id: e.target.value })}
                                    className="select flex-1"
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categoriasProblemas.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={problemaInput.causado_por_usuario}
                                        onChange={(e) => setProblemaInput({ ...problemaInput, causado_por_usuario: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">Causado por usuario</span>
                                </label>
                                <button type="button" onClick={handleAddProblema} className="btn btn-primary">
                                    Agregar
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {problemasResueltos.map((prob, i) => (
                                <div key={i} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-medium text-slate-900">{prob.descripcion}</p>
                                        <div className="flex gap-2 text-xs mt-1">
                                            <span className="badge badge-primary">{prob.categoria_nombre}</span>
                                            {prob.causado_por_usuario && <span className="badge badge-danger">Usuario</span>}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setProblemasResueltos(problemasResueltos.filter((_, idx) => idx !== i))}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        aria-label="Eliminar problema"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
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
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCaso();
                                    }
                                }}
                                placeholder="Nro Ticket (ej: CRM-123) - Presiona Enter para agregar"
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
                        <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">5. Observaciones Finales</h4>
                        <textarea
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows="3"
                            className="textarea w-full"
                            placeholder="Comentarios generales sobre la visita..."
                        />
                    </section>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary px-6"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-success px-6 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {loading ? 'Finalizando...' : 'Finalizar Visita y Enviar Minuta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormInformeVisita;
