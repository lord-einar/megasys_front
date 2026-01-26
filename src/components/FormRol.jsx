import { useState, useEffect } from 'react';
import { rolesAPI } from '../services/api';
import LoadingOverlay from './LoadingOverlay';

const FormRol = ({ onClose, onSave, rolEditar = null, roles = [] }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        parent_id: '',
        activo: true
    });

    useEffect(() => {
        if (rolEditar) {
            setFormData({
                nombre: rolEditar.nombre || '',
                descripcion: rolEditar.descripcion || '',
                parent_id: rolEditar.parent_id || '',
                activo: rolEditar.activo !== undefined ? rolEditar.activo : true
            });
        }
    }, [rolEditar]);

    // Filtrar roles disponibles como padres (excluir el rol actual y sus descendientes)
    const rolesDisponibles = roles.filter(rol => {
        // No puede ser padre de sí mismo
        if (rolEditar && rol.id === rolEditar.id) return false;
        // No puede seleccionar sus propios sub-roles como padre (evitar ciclos)
        if (rolEditar && rol.parent_id === rolEditar.id) return false;
        return true;
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Preparar datos: convertir string vacío a null para parent_id
            const dataToSend = {
                ...formData,
                parent_id: formData.parent_id || null
            };

            if (rolEditar) {
                await rolesAPI.update(rolEditar.id, dataToSend);
            } else {
                await rolesAPI.create(dataToSend);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error guardando el rol');
        } finally {
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
                            {rolEditar ? 'Editar Rol' : 'Nuevo Rol'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Complete los datos del rol</p>
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
                        <div className="space-y-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Nombre del Rol <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Soporte Técnico"
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                            />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Categoría de Rol (Opcional)
                            </label>
                            <select
                                name="parent_id"
                                value={formData.parent_id}
                                onChange={handleChange}
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
                            >
                                <option value="">Rol Principal (Categoría)</option>
                                {rolesDisponibles.map(rol => (
                                    <option key={rol.id} value={rol.id}>
                                        {rol.nombre} {rol.rolPadre ? `(Especialización de ${rol.rolPadre.nombre})` : '(Categoría)'}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Deja vacío para crear una categoría principal (ej: Sistemas, Gerentes, Coordinadores).
                                <br />
                                Selecciona una categoría para crear una especialización (ej: Soporte Técnico dentro de Sistemas).
                            </p>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Descripción
                            </label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Descripción del rol..."
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        {rolEditar && (
                            <div className="space-y-1 flex items-center">
                                <input
                                    id="activo"
                                    name="activo"
                                    type="checkbox"
                                    checked={formData.activo}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded"
                                />
                                <label htmlFor="activo" className="ml-2 block text-sm font-semibold text-slate-700">
                                    Rol Activo
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            {rolEditar ? 'Guardar Cambios' : 'Crear Rol'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormRol;
