import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ModalDetalleVisita from '../components/visitas/ModalDetalleVisita';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

export default function ReportesVisitasPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [filtros, setFiltros] = useState({
        fecha_desde: '',
        fecha_hasta: '',
        tecnico_ids: '',
        sede_ids: '',
        estado: '',
        tipo: ''
    });

    const [sedes, setSedes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);

    // Pestaña activa
    const [vistaActual, setVistaActual] = useState('dashboard');

    // Modal de detalle
    const [showDetalleVisita, setShowDetalleVisita] = useState(false);
    const [selectedVisitaId, setSelectedVisitaId] = useState(null);

    useEffect(() => {
        if (user) {
            cargarOpciones();
            cargarDatos();
        }
    }, [user]);

    const cargarOpciones = async () => {
        try {
            const token = localStorage.getItem('authToken');

            // Cargar sedes y personal con límite alto para traer todos
            const sedesRes = await axios.get(`${API_BASE}/sedes?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const personalRes = await axios.get(`${API_BASE}/personal?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allSedes = sedesRes.data.data.sedes || sedesRes.data.data;
            const allPersonal = personalRes.data.data.personal || personalRes.data.data;

            // Filtrar solo técnicos con rol "soporte técnico" o "sistemas"
            const tecnicosSoporte = allPersonal.filter(p => {
                const rolNombre = p.rol?.nombre?.toLowerCase();
                return rolNombre === 'soporte técnico' || rolNombre === 'soporte tecnico' || rolNombre === 'support' || rolNombre === 'sistemas';
            });

            setSedes(allSedes);
            setTecnicos(tecnicosSoporte);
        } catch (error) {
            // Error silenciado en producción
        }
    };

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const params = new URLSearchParams();
            Object.keys(filtros).forEach(key => {
                if (filtros[key]) params.append(key, filtros[key]);
            });

            const response = await axios.get(`${API_BASE}/visitas/reportes/dashboard?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setData(response.data.data);
        } catch (error) {
            // Error silenciado en producción
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (key, value) => {
        setFiltros(prev => ({ ...prev, [key]: value }));
    };

    const aplicarFiltros = () => {
        cargarDatos();
    };

    const limpiarFiltros = () => {
        setFiltros({
            fecha_desde: '',
            fecha_hasta: '',
            tecnico_ids: '',
            sede_ids: '',
            estado: '',
            tipo: ''
        });
        setTimeout(() => cargarDatos(), 100);
    };

    const handleVerDetalle = (visitaId) => {
        setSelectedVisitaId(visitaId);
        setShowDetalleVisita(true);
    };

    const handleCloseDetalle = () => {
        setShowDetalleVisita(false);
        setSelectedVisitaId(null);
        cargarDatos(); // Recargar por si hubo cambios
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-slate-600">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    // Filtrar visitas para mostrar solo realizadas o canceladas (excluir programadas)
    const visitasFiltradas = data?.visitas?.filter(v =>
        v.estado === 'realizada' || v.estado === 'cancelada'
    ) || [];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">📊 Dashboard de Reportes de Visitas</h1>
                <p className="text-slate-600">Estadísticas y análisis de minutas de visitas</p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">🔍 Filtros</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
                        <input
                            type="date"
                            value={filtros.fecha_desde}
                            onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
                        <input
                            type="date"
                            value={filtros.fecha_hasta}
                            onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sede</label>
                        <select
                            value={filtros.sede_ids}
                            onChange={(e) => handleFiltroChange('sede_ids', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Todas</option>
                            {sedes.map(sede => (
                                <option key={sede.id} value={sede.id}>{sede.nombre_sede}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Técnico</label>
                        <select
                            value={filtros.tecnico_ids}
                            onChange={(e) => handleFiltroChange('tecnico_ids', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Todos</option>
                            {tecnicos.map(tec => (
                                <option key={tec.id} value={tec.id}>{tec.nombre} {tec.apellido}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                        <select
                            value={filtros.estado}
                            onChange={(e) => handleFiltroChange('estado', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Todos</option>
                            <option value="programada">Programada</option>
                            <option value="realizada">Realizada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                        <select
                            value={filtros.tipo}
                            onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Todos</option>
                            <option value="urgencia">Urgencia</option>
                            <option value="solicitud">Solicitud</option>
                            <option value="programada">Programada</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={aplicarFiltros}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Aplicar Filtros
                    </button>
                    <button
                        onClick={limpiarFiltros}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            {/* Pestañas */}
            <div className="bg-white rounded-lg shadow-sm p-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setVistaActual('dashboard')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            vistaActual === 'dashboard'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setVistaActual('lista')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            vistaActual === 'lista'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        📋 Lista de Visitas ({visitasFiltradas.length})
                    </button>
                </div>
            </div>

            {/* Vista Dashboard */}
            {vistaActual === 'dashboard' && (
                <>
                    {/* Métricas Generales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Visitas"
                    value={data?.metricas?.totalVisitas || 0}
                    icon="📅"
                    color="blue"
                />
                <MetricCard
                    title="Visitas Realizadas"
                    value={data?.metricas?.visitasRealizadas || 0}
                    icon="✅"
                    color="green"
                />
                <MetricCard
                    title="Problemas Resueltos"
                    value={data?.metricas?.problemasResueltos || 0}
                    icon="🔧"
                    color="purple"
                />
                <MetricCard
                    title="Casos Cerrados"
                    value={data?.metricas?.totalCasos || 0}
                    icon="🎫"
                    color="orange"
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Visitas por Sede" data={data?.graficos?.sedes} />
                <ChartCard title="Visitas por Técnico" data={data?.graficos?.tecnicos} />
                <ChartCard title="Problemas por Categoría" data={data?.graficos?.categorias} />
                <ChartCard title="Problemas Causados por Usuario" data={data?.graficos?.problemasUsuario} />
                <ChartCard title="Estados de Visitas" data={data?.graficos?.estados} />
                <ChartCard title="Tipos de Visitas" data={data?.graficos?.tipos} />
            </div>

                    {/* Tabla de Casos Cerrados */}
                    <CasosTable casos={data?.casos} />
                </>
            )}

            {/* Vista Lista de Visitas */}
            {vistaActual === 'lista' && (
                <VisitasTable visitas={visitasFiltradas} onVerDetalle={handleVerDetalle} />
            )}

            {/* Modal de Detalle */}
            {showDetalleVisita && (
                <ModalDetalleVisita
                    visitaId={selectedVisitaId}
                    onClose={handleCloseDetalle}
                />
            )}
        </div>
    );
}

// Componente de Métrica
function MetricCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };

    return (
        <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-75">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}

// Componente de Gráfico
function ChartCard({ title, data }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
                <div className="h-64 flex items-center justify-center text-slate-400">
                    Sin datos disponibles
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// Componente de Tabla de Casos
function CasosTable({ casos }) {
    if (!casos || casos.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">📋 Casos/Tickets Cerrados</h3>
                <div className="text-slate-400 text-center py-8">
                    No hay casos cerrados para mostrar
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                📋 Casos/Tickets Cerrados ({casos.length})
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Caso/Ticket
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Técnico
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Sede
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {casos.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {new Date(item.fecha_visita).toLocaleDateString('es-AR')}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-900">
                                    {item.caso}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {item.tecnico}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {item.sede}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Componente de Tabla de Visitas
function VisitasTable({ visitas, onVerDetalle }) {
    if (!visitas || visitas.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">📅 Lista de Visitas</h3>
                <div className="text-slate-400 text-center py-8">
                    No hay visitas para mostrar con los filtros seleccionados
                </div>
            </div>
        );
    }

    const getEstadoBadge = (estado) => {
        const styles = {
            programada: 'bg-blue-100 text-blue-800 border-blue-200',
            realizada: 'bg-green-100 text-green-800 border-green-200',
            cancelada: 'bg-slate-100 text-slate-800 border-slate-200',
        };
        const labels = {
            programada: 'Programada',
            realizada: 'Realizada',
            cancelada: 'Cancelada',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>
                {labels[estado] || estado}
            </span>
        );
    };

    const getTipoBadge = (tipo) => {
        const styles = {
            urgencia: 'bg-red-100 text-red-800',
            solicitud: 'bg-yellow-100 text-yellow-800',
            programada: 'bg-blue-100 text-blue-800',
        };
        const labels = {
            urgencia: 'Urgencia',
            solicitud: 'Solicitud',
            programada: 'Programada',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[tipo] || 'bg-gray-100 text-gray-800'}`}>
                {labels[tipo] || tipo}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                📅 Lista de Visitas ({visitas.length})
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Sede
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Técnico
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Informe
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {visitas.map((visita) => (
                            <tr key={visita.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {new Date(visita.fecha).toLocaleDateString('es-AR')}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-900">
                                    {visita.sede}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {visita.tecnico}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {getTipoBadge(visita.tipo)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {getEstadoBadge(visita.estado)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    {visita.tiene_informe ? (
                                        <span className="text-green-600">✓</span>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => onVerDetalle(visita.id)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Ver Detalle
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
