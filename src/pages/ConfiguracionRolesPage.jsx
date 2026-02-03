import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rolesAPI, personalAPI } from '../services/api';
import { usePermissions } from '../hooks/usePermissions';
import FormRol from '../components/FormRol';
import LoadingOverlay from '../components/LoadingOverlay';
import Swal from 'sweetalert2';

const ConfiguracionRolesPage = () => {
    const navigate = useNavigate();
    const { isSuperAdmin, isHelpdesk, hasRole } = usePermissions();
    const canAccessRoles = isSuperAdmin || isHelpdesk;
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [rolEditar, setRolEditar] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroActivo, setFiltroActivo] = useState('todos');

    useEffect(() => {
        if (!canAccessRoles) {
            navigate('/', {
                state: {
                    error: 'No tienes permiso para acceder a la configuración de roles.'
                }
            });
        }
    }, [canAccessRoles, navigate]);

    useEffect(() => {
        cargarRoles();
    }, []);

    const cargarRoles = async () => {
        try {
            setLoading(true);
            const response = await rolesAPI.list();
            setRoles(response.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Error al cargar roles');
        } finally {
            setLoading(false);
        }
    };

    const handleNuevoRol = () => {
        setRolEditar(null);
        setMostrarModal(true);
    };

    const handleEditarRol = (rol) => {
        setRolEditar(rol);
        setMostrarModal(true);
    };

    const handleEliminarRol = async (rol) => {
        const result = await Swal.fire({
            title: '¿Eliminar rol?',
            text: `¿Estás seguro de eliminar el rol "${rol.nombre}"? Esta acción lo desactivará.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            await rolesAPI.delete(rol.id);
            await Swal.fire('Eliminado', 'El rol ha sido desactivado correctamente', 'success');
            await cargarRoles();
        } catch (err) {
            Swal.fire('Error', err.message || 'Error al eliminar el rol', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerPersonal = async (rol) => {
        try {
            setLoading(true);
            const response = await rolesAPI.getPersonalPorRol(rol.id);
            const personal = response.data?.personal || [];

            if (personal.length === 0) {
                await Swal.fire({
                    title: `Personal con rol "${rol.nombre}"`,
                    text: 'No hay personal asignado a este rol',
                    icon: 'info'
                });
            } else {
                const listaHTML = personal.map(p =>
                    `<div class="text-left py-2 px-3 hover:bg-gray-50 rounded">
                        <div class="font-semibold text-gray-800">${p.nombre} ${p.apellido}</div>
                        <div class="text-sm text-gray-500">${p.email}</div>
                    </div>`
                ).join('');

                await Swal.fire({
                    title: `Personal con rol "${rol.nombre}"`,
                    html: `
                        <div class="max-h-96 overflow-y-auto">
                            <div class="text-sm text-gray-600 mb-3">Total: ${personal.length} persona(s)</div>
                            <div class="space-y-1">${listaHTML}</div>
                        </div>
                    `,
                    width: '600px',
                    confirmButtonText: 'Cerrar'
                });
            }
        } catch (err) {
            Swal.fire('Error', err.message || 'Error al obtener el personal', 'error');
        } finally {
            setLoading(false);
        }
    };

    const rolesFiltrados = roles.filter(rol => {
        const cumpleBusqueda = !busqueda ||
            rol.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (rol.descripcion && rol.descripcion.toLowerCase().includes(busqueda.toLowerCase()));

        const cumpleActivo = filtroActivo === 'todos' ||
            (filtroActivo === 'activos' && rol.activo) ||
            (filtroActivo === 'inactivos' && !rol.activo);

        return cumpleBusqueda && cumpleActivo;
    });

    // Organizar roles en estructura jerárquica
    const rolesJerarquicos = rolesFiltrados.filter(rol => !rol.parent_id);
    const subRolesMap = {};
    rolesFiltrados.forEach(rol => {
        if (rol.parent_id) {
            if (!subRolesMap[rol.parent_id]) {
                subRolesMap[rol.parent_id] = [];
            }
            subRolesMap[rol.parent_id].push(rol);
        }
    });

    if (!canAccessRoles) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {loading && <LoadingOverlay message="Cargando roles..." />}

            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Configuración de Roles</h1>
                        <p className="text-slate-500 mt-1">Organiza roles en categorías y especializaciones</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Ej: <strong>Sistemas</strong> con especializaciones: Soporte Técnico, Mesa de Ayuda, Infraestructura
                        </p>
                    </div>
                    <button
                        onClick={handleNuevoRol}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Rol
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFiltroActivo('todos')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                filtroActivo === 'todos'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFiltroActivo('activos')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                filtroActivo === 'activos'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Activos
                        </button>
                        <button
                            onClick={() => setFiltroActivo('inactivos')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                filtroActivo === 'inactivos'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            Inactivos
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md mb-6">
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

            {/* Roles Grid */}
            {rolesFiltrados.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No se encontraron roles</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {busqueda ? 'Intenta con otros términos de búsqueda' : 'Comienza creando un nuevo rol'}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {rolesJerarquicos.map((rol) => (
                        <div key={rol.id}>
                            {/* Rol Principal */}
                            <RolCard
                                rol={rol}
                                onVerPersonal={handleVerPersonal}
                                onEditar={handleEditarRol}
                                onEliminar={handleEliminarRol}
                            />

                            {/* Especializaciones */}
                            {subRolesMap[rol.id] && subRolesMap[rol.id].length > 0 && (
                                <div className="ml-8 mt-4 space-y-4 border-l-2 border-blue-300 pl-6">
                                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
                                        Especializaciones de {rol.nombre}
                                    </div>
                                    {subRolesMap[rol.id].map((subRol) => (
                                        <RolCard
                                            key={subRol.id}
                                            rol={subRol}
                                            onVerPersonal={handleVerPersonal}
                                            onEditar={handleEditarRol}
                                            onEliminar={handleEliminarRol}
                                            isSubRole={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {mostrarModal && (
                <FormRol
                    onClose={() => setMostrarModal(false)}
                    onSave={cargarRoles}
                    rolEditar={rolEditar}
                    roles={roles}
                />
            )}
        </div>
    );
};

// Componente para tarjeta de rol
const RolCard = ({ rol, onVerPersonal, onEditar, onEliminar, isSubRole = false }) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
            isSubRole
                ? 'border-blue-200 bg-blue-50/20'
                : 'border-slate-300 ring-2 ring-slate-100'
        }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {!isSubRole && (
                            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        )}
                        {isSubRole && (
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        )}
                        <h3 className={`text-lg font-bold ${isSubRole ? 'text-blue-900' : 'text-slate-800'}`}>
                            {rol.nombre}
                        </h3>
                    </div>
                    {rol.descripcion && (
                        <p className="text-sm text-slate-500 line-clamp-2">{rol.descripcion}</p>
                    )}
                    {rol.rolPadre && (
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-blue-600 font-medium">Especialización de:</span>
                            <span className="text-xs text-blue-700 font-semibold">{rol.rolPadre.nombre}</span>
                        </div>
                    )}
                    {!rol.parent_id && (
                        <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-xs text-purple-600 font-medium">Categoría Principal</span>
                        </div>
                    )}
                </div>
                <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rol.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {rol.activo ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            {rol.totalPersonal !== undefined && (
                <div className="flex items-center text-sm mb-4 pt-2 border-t border-slate-100">
                    <svg className="w-4 h-4 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-slate-600 font-medium">{rol.totalPersonal} persona(s) con este rol</span>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => onVerPersonal(rol)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Ver Personal
                </button>
                <button
                    onClick={() => onEditar(rol)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button
                    onClick={() => onEliminar(rol)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Continuar con el resto del código eliminando la parte antigua de map
export default ConfiguracionRolesPage;
