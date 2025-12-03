import React, { useState, useEffect } from 'react';
import { visitasAPI, personalAPI } from '../services/api';
import CalendarioMensual from '../components/visitas/CalendarioMensual';
import FormVisita from '../components/visitas/FormVisita';
import ModalDetalleVisita from '../components/visitas/ModalDetalleVisita';
import FormInformeVisita from '../components/visitas/FormInformeVisita';
import LoadingOverlay from '../components/LoadingOverlay';

const VisitasPage = () => {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tecnicos, setTecnicos] = useState([]);
    const [filtroTecnico, setFiltroTecnico] = useState('');
    const [fechaActual, setFechaActual] = useState(new Date());
    const [vistaActual, setVistaActual] = useState('month');

    // Modals state
    const [showFormVisita, setShowFormVisita] = useState(false);
    const [showDetalleVisita, setShowDetalleVisita] = useState(false);
    const [showInformeVisita, setShowInformeVisita] = useState(false);

    const [selectedVisitaId, setSelectedVisitaId] = useState(null);
    const [selectedVisitaObj, setSelectedVisitaObj] = useState(null); // Objeto completo para edición/informe
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

    useEffect(() => {
        cargarTecnicos();
    }, []);

    useEffect(() => {
        cargarEventos();
    }, [fechaActual, filtroTecnico]);

    const cargarTecnicos = async () => {
        try {
            // Solicitar usuarios con el límite máximo permitido (100)
            const response = await personalAPI.list({ limit: 100 });
            console.log('📊 Respuesta completa de personal:', response);
            console.log('📊 Personal data:', response.data);

            if (response.data) {
                // Mostrar los roles de cada persona para debug
                response.data.forEach(p => {
                    console.log(`👤 ${p.nombre} ${p.apellido} - Rol nombre: "${p.rol?.nombre}" - Rol completo:`, p.rol);
                });

                // Filtrar solo personal con rol 'Soporte Técnico' o 'Sistemas'
                const tecnicosSoporte = response.data.filter(p =>
                    p.rol?.nombre === 'Soporte Técnico' || p.rol?.nombre === 'Sistemas'
                );
                console.log('✅ Técnicos filtrados:', tecnicosSoporte);

                // Si no hay técnicos filtrados, mostrar todos temporalmente para debug
                if (tecnicosSoporte.length === 0) {
                    console.warn('⚠️ No se encontraron técnicos con rol "Soporte Técnico" o "Sistemas". Mostrando todos los usuarios temporalmente.');
                    setTecnicos(response.data);
                } else {
                    setTecnicos(tecnicosSoporte);
                }
            }
        } catch (error) {
            console.error('Error cargando técnicos:', error);
        }
    };

    const cargarEventos = async () => {
        setLoading(true);
        try {
            const mes = fechaActual.getMonth() + 1;
            const anio = fechaActual.getFullYear();
            const response = await visitasAPI.getCalendario(mes, anio, filtroTecnico);

            if (response.data) {
                const eventosFormateados = response.data.map(e => ({
                    ...e,
                    start: new Date(e.start),
                    end: new Date(e.end)
                }));
                setEventos(eventosFormateados);
            }
        } catch (error) {
            console.error('Error cargando calendario:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleSelectEvent = (evento) => {
        setSelectedVisitaId(evento.id);
        setShowDetalleVisita(true);
    };

    const handleSelectSlot = ({ start }) => {
        setFechaSeleccionada(start);
        setSelectedVisitaObj(null); // Limpiar para nueva visita
        setShowFormVisita(true);
    };

    const handleEditVisita = (visita) => {
        setSelectedVisitaObj(visita);
        setShowDetalleVisita(false);
        setShowFormVisita(true);
    };

    const handleCompletarInforme = (visita) => {
        setSelectedVisitaObj(visita);
        setShowDetalleVisita(false);
        setShowInformeVisita(true);
    };

    const handleSaveVisita = () => {
        cargarEventos(); // Recargar calendario
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {loading && <LoadingOverlay message="Cargando calendario..." />}

            {/* Encabezado */}
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Calendario de Visitas</h1>
                    <p className="text-gray-600 mt-2">Gestiona y programa visitas técnicas a las sedes</p>
                </div>
                <button
                    onClick={() => handleSelectSlot({ start: new Date() })}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                    + Nueva Visita
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Filtrar por Técnico:</label>
                    <select
                        className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filtroTecnico}
                        onChange={(e) => setFiltroTecnico(e.target.value)}
                    >
                        <option value="">Todos los técnicos</option>
                        {tecnicos.map(t => (
                            <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                        ))}
                    </select>
                </div>
            </div>

            <CalendarioMensual
                eventos={eventos}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                date={fechaActual}
                onNavigate={(newDate) => setFechaActual(newDate)}
                view={vistaActual}
                onView={(newView) => setVistaActual(newView)}
            />

            {/* Modals */}
            {showFormVisita && (
                <FormVisita
                    onClose={() => setShowFormVisita(false)}
                    onSave={handleSaveVisita}
                    visitaEditar={selectedVisitaObj}
                    fechaPreseleccionada={fechaSeleccionada}
                />
            )}

            {showDetalleVisita && (
                <ModalDetalleVisita
                    visitaId={selectedVisitaId}
                    onClose={() => setShowDetalleVisita(false)}
                    onEdit={handleEditVisita}
                    onCompletar={handleCompletarInforme}
                />
            )}

            {showInformeVisita && (
                <FormInformeVisita
                    visita={selectedVisitaObj}
                    onClose={() => setShowInformeVisita(false)}
                    onSave={handleSaveVisita}
                />
            )}
        </div>
    );
};

export default VisitasPage;
