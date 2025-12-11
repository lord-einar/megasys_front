
import React, { useState, useEffect } from 'react';
import { visitasAPI, personalAPI } from '../services/api';
import { getLocalDateString, parseLocalDate } from '../utils/dateUtils';
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
    const [stats, setStats] = useState(null);

    // Modals state
    const [showFormVisita, setShowFormVisita] = useState(false);
    const [showDetalleVisita, setShowDetalleVisita] = useState(false);
    const [showInformeVisita, setShowInformeVisita] = useState(false);

    const [selectedVisitaId, setSelectedVisitaId] = useState(null);
    const [selectedVisitaObj, setSelectedVisitaObj] = useState(null);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

    useEffect(() => {
        cargarTecnicos();
        cargarEstadisticas();
    }, []);

    useEffect(() => {
        cargarEventos();

        // Auto-refresh when tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                cargarEventos();
                cargarEstadisticas();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fechaActual, filtroTecnico]);

    const cargarTecnicos = async () => {
        try {
            const response = await personalAPI.list({ limit: 100 });
            if (response.data) {
                const tecnicosSoporte = response.data.filter(p =>
                    p.rol?.nombre === 'Soporte Técnico' || p.rol?.nombre === 'Sistemas'
                );
                setTecnicos(tecnicosSoporte.length > 0 ? tecnicosSoporte : response.data);
            }
        } catch (error) {
            console.error('Error cargando técnicos:', error);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            // Obtener estadísticas del mes actual
            const fechaInicio = getLocalDateString(new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1));
            const fechaFin = getLocalDateString(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0));
            const response = await visitasAPI.getEstadisticas({ fecha_desde: fechaInicio, fecha_hasta: fechaFin });
            setStats(response.data);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
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
                    start: parseLocalDate(e.start),
                    end: parseLocalDate(e.end)
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
        setSelectedVisitaObj(null);
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
        cargarEventos();
        cargarEstadisticas();
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
            {loading && <LoadingOverlay message="Actualizando calendario..." />}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Calendario de Visitas</h1>
                    <p className="text-slate-500 mt-1 text-sm">Gestión y programación de visitas técnicas a sedes</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => cargarEventos()}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium shadow-sm"
                    >
                        ↻ Actualizar
                    </button>
                    <button
                        onClick={() => handleSelectSlot({ start: new Date() })}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                    >
                        <span>+</span> Nueva Visita
                    </button>
                </div>
            </div>

            {/* Stats Cards (Mocked if no API yet, or using stats state) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Visitas (Mes)"
                    value={stats?.total || eventos.length}
                    icon="📅"
                    color="blue"
                />
                <StatCard
                    title="Pendientes"
                    value={stats?.visitas_pendientes || eventos.filter(e => e.extendedProps?.estado === 'programada').length}
                    icon="⏳"
                    color="yellow"
                />
                <StatCard
                    title="Realizadas"
                    value={stats?.visitas_realizadas || eventos.filter(e => e.extendedProps?.estado === 'realizada').length}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    title="Urgencias"
                    value={eventos.filter(e => e.extendedProps?.tipo === 'urgencia').length}
                    icon="🚨"
                    color="red"
                />
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Filtros:</span>
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                                value={filtroTecnico}
                                onChange={(e) => setFiltroTecnico(e.target.value)}
                            >
                                <option value="">Todos los técnicos</option>
                                {tecnicos.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setVistaActual('month')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${vistaActual === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setVistaActual('agenda')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${vistaActual === 'agenda' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Agenda
                        </button>
                    </div>
                </div>

                {/* Calendar Wrapper */}
                <div className="p-6 bg-white min-h-[750px]">
                    <CalendarioMensual
                        eventos={eventos}
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        date={fechaActual}
                        onNavigate={(newDate) => setFechaActual(newDate)}
                        view={vistaActual}
                        onView={(newView) => setVistaActual(newView)}
                    />
                </div>
            </div>

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

// Helper Component for Stats
const StatCard = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        yellow: 'bg-amber-50 text-amber-600 border-amber-100',
        red: 'bg-rose-50 text-rose-600 border-rose-100',
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color] || 'bg-slate-50'}`}>
                <span className="text-xl">{icon}</span>
            </div>
        </div>
    );
};

export default VisitasPage;
