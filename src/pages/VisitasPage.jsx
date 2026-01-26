
import React, { useState, useEffect } from 'react';
import { visitasAPI, personalAPI } from '../services/api';
import { getLocalDateString, parseLocalDate } from '../utils/dateUtils';
import CalendarioMensual from '../components/visitas/CalendarioMensual';
import FormVisita from '../components/visitas/FormVisita';
import ModalDetalleVisita from '../components/visitas/ModalDetalleVisita';
import FormInformeVisita from '../components/visitas/FormInformeVisita';
import ModalVisitasDelDia from '../components/visitas/ModalVisitasDelDia';
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
    const [showVisitasDelDia, setShowVisitasDelDia] = useState(false);

    const [selectedVisitaId, setSelectedVisitaId] = useState(null);
    const [selectedVisitaObj, setSelectedVisitaObj] = useState(null);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [visitasDelDia, setVisitasDelDia] = useState([]);

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

    const handleShowMore = (eventos, fecha) => {
        setVisitasDelDia(eventos);
        setFechaSeleccionada(fecha);
        setShowVisitasDelDia(true);
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
            {loading && <LoadingOverlay message="Actualizando calendario..." />}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Calendario de Visitas</h1>
                    <p className="text-slate-500 mt-1 font-medium">Gestión y programación de visitas técnicas a sedes</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => cargarEventos()}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <span className="text-lg">↻</span> Actualizar
                    </button>
                    <button
                        onClick={() => handleSelectSlot({ start: new Date() })}
                        className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <span className="text-lg font-bold">+</span> Nueva Visita
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Visitas (Mes)"
                    value={stats?.total || eventos.length}
                    icon="📅"
                    color="navy"
                />
                <StatCard
                    title="Pendientes"
                    value={stats?.visitas_pendientes || eventos.filter(e => e.extendedProps?.estado === 'programada').length}
                    icon="⏳"
                    color="warning"
                />
                <StatCard
                    title="Realizadas"
                    value={stats?.visitas_realizadas || eventos.filter(e => e.extendedProps?.estado === 'realizada').length}
                    icon="✅"
                    color="success"
                />
                <StatCard
                    title="Urgencias"
                    value={eventos.filter(e => e.extendedProps?.tipo === 'urgencia').length}
                    icon="🚨"
                    color="error"
                />
            </div>

            {/* Main Content Card */}
            <div className="card-base overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por Técnico:</span>
                        <div className="relative group">
                            <select
                                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors w-64"
                                value={filtroTecnico}
                                onChange={(e) => setFiltroTecnico(e.target.value)}
                            >
                                <option value="">Todos los técnicos</option>
                                {tecnicos.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 group-hover:text-primary-600">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setVistaActual('month')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${vistaActual === 'month' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setVistaActual('agenda')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${vistaActual === 'agenda' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
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
                        onShowMore={handleShowMore}
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

            {showVisitasDelDia && (
                <ModalVisitasDelDia
                    fecha={fechaSeleccionada}
                    visitas={visitasDelDia}
                    onClose={() => setShowVisitasDelDia(false)}
                    onSelectVisita={handleSelectEvent}
                />
            )}
        </div>
    );
};

// Helper Component for Stats
const StatCard = ({ title, value, icon, color }) => {
    const colorStyles = {
        navy: { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-100' },
        warning: { bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-100' },
        success: { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-100' },
        error: { bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-100' },
    };

    const style = colorStyles[color] || colorStyles.navy;

    return (
        <div className={`bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group border-l-4 ${color === 'navy' ? 'border-l-primary-500' : ''} ${color === 'warning' ? 'border-l-warning-500' : ''} ${color === 'success' ? 'border-l-success-500' : ''} ${color === 'error' ? 'border-l-error-500' : ''}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-navy-900">{value}</h3>
                </div>
                <div className={`p-2.5 rounded-lg ${style.bg} ${style.text} ${style.border} border shadow-sm group-hover:scale-110 transition-transform`}>
                    <span className="text-lg">{icon}</span>
                </div>
            </div>
        </div>
    );
};

export default VisitasPage;
