import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'

export default function ModalTipoArticulo({ isOpen, onClose, onSave, item = null }) {
    const isEditing = !!item
    const [submitting, setSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm({
        defaultValues: {
            nombre: '',
            descripcion: '',
            activo: true
        }
    })

    // Watch activo para el switch
    const activo = watch('activo')

    useEffect(() => {
        if (isOpen) {
            if (item) {
                reset({
                    nombre: item.nombre || '',
                    descripcion: item.descripcion || '',
                    activo: item.activo ?? true
                })
            } else {
                reset({
                    nombre: '',
                    descripcion: '',
                    activo: true
                })
            }
        }
    }, [isOpen, item, reset])

    const onSubmit = async (data) => {
        try {
            setSubmitting(true)

            const formData = {
                nombre: data.nombre.trim(),
                descripcion: data.descripcion?.trim() || null,
                activo: data.activo
            }

            await onSave(formData)
            onClose()

        } catch (error) {
            console.error('Error en modal:', error)
            // El error lo maneja el padre si es necesario, o aquí mostramos alerta
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal Panel */}
                <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${isEditing ? 'bg-amber-100' : 'bg-primary-100'}`}>
                                {isEditing ? (
                                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                )}
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                    {isEditing ? 'Editar Tipo de Artículo' : 'Nuevo Tipo de Artículo'}
                                </h3>
                                <div className="mt-4 space-y-4">
                                    <form id="tipo-form" onSubmit={handleSubmit(onSubmit)}>
                                        {/* Nombre */}
                                        <div className="space-y-1">
                                            <label htmlFor="nombre" className="block text-sm font-bold text-gray-700">
                                                Nombre <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="nombre"
                                                {...register('nombre', {
                                                    required: 'El nombre es requerido',
                                                    minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                                                    maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                                                })}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${errors.nombre ? 'border-rose-300 focus:ring-rose-200' : 'border-gray-300'}`}
                                                placeholder="Ej: Laptop, Monitor..."
                                            />
                                            {errors.nombre && <p className="text-xs text-rose-500 font-medium">{errors.nombre.message}</p>}
                                        </div>

                                        {/* Descripción */}
                                        <div className="space-y-1">
                                            <label htmlFor="descripcion" className="block text-sm font-bold text-gray-700">
                                                Descripción
                                            </label>
                                            <textarea
                                                id="descripcion"
                                                rows={3}
                                                {...register('descripcion', {
                                                    maxLength: { value: 200, message: 'Máximo 200 caracteres' }
                                                })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                                                placeholder="Descripción opcional..."
                                            />
                                            {errors.descripcion && <p className="text-xs text-rose-500 font-medium">{errors.descripcion.message}</p>}
                                        </div>

                                        {/* Activo Switch */}
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">Estado</span>
                                                <span className="text-xs text-gray-500">Habilitar categoría</span>
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    {...register('activo')}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                            </label>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                        <button
                            type="submit"
                            form="tipo-form"
                            disabled={submitting}
                            className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${submitting ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                                }`}
                        >
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
