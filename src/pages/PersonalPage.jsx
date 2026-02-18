import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalAPI, empresasAPI } from '../services/api'
import Swal from 'sweetalert2'
import { usePermissions } from '../hooks/usePermissions'
import { useListData } from '../hooks/useListData'
import { usePermissionError } from '../hooks/usePermissionError'
import { normalizeStatsResponse } from '../utils/apiResponseNormalizer'
import { getPaginationNumbers, getRecordRange } from '../utils/paginationHelper'

export default function PersonalPage() {
  const navigate = useNavigate()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  // Hook para manejar errores de permisos
  usePermissionError()

  // Estado de búsqueda
  const [filtro, setFiltro] = useState('')
  const [empresaFiltro, setEmpresaFiltro] = useState('')
  const [empresas, setEmpresas] = useState([])
  const [exportando, setExportando] = useState(false)
  const [estadisticas, setEstadisticas] = useState(null)

  // Hook para manejar listado con paginación
  const {
    data: personal,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalRecords,
    updateFilters,
    goToPage,
    previousPage,
    nextPage,
    reload
  } = useListData(personalAPI.list, {
    initialLimit: 10,
    initialFilters: { search: '', empresa_id: '' }
  })

  useEffect(() => {
    cargarEstadisticas()
    cargarEmpresas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      const response = await personalAPI.getEstadisticas()
      setEstadisticas(normalizeStatsResponse(response))
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const cargarEmpresas = async () => {
    try {
      const response = await empresasAPI.getActivas()
      setEmpresas(response.data || [])
    } catch (err) {
      console.error('Error cargando empresas:', err)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    updateFilters({ search: filtro, empresa_id: empresaFiltro })
  }

  const handleExportar = async () => {
    try {
      setExportando(true)
      const params = {
        search: filtro,
        ...(empresaFiltro && { empresa_id: empresaFiltro })
      }

      const blob = await personalAPI.export(params)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `personal_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      Swal.fire({
        title: 'Exportado',
        text: 'El archivo CSV se ha descargado correctamente',
        icon: 'success',
        timer: 2000,
        customClass: { popup: 'rounded-2xl' }
      })
    } catch (err) {
      console.error('Error exportando:', err)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo exportar el personal',
        icon: 'error',
        customClass: { popup: 'rounded-2xl' }
      })
    } finally {
      setExportando(false)
    }
  }

  const eliminarPersona = async (persona) => {
    const result = await Swal.fire({
      title: 'Confirmar eliminación',
      html: `¿Está seguro de que desea eliminar a <strong>${persona.nombre} ${persona.apellido}</strong>?<br/><br/><span style="color: #ef4444; font-size: 0.875rem;">Esta acción no puede ser deshecha.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      backdrop: true,
      allowOutsideClick: false,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-4 py-2 bg-rose-600 text-white rounded-lg',
        cancelButton: 'px-4 py-2 bg-slate-200 text-slate-700 rounded-lg'
      }
    })

    if (result.isConfirmed) {
      try {
        await personalAPI.delete(persona.id)
        await Swal.fire({
          title: 'Eliminado',
          text: 'El personal ha sido eliminado correctamente.',
          icon: 'success',
          timer: 1500,
          timerProgressBar: true,
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'px-4 py-2 bg-emerald-600 text-white rounded-lg'
          }
        })
        reload()
      } catch (err) {
        console.error('Error eliminando personal:', err)
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el personal: ' + (err.message || 'Error desconocido'),
          icon: 'error',
          customClass: { popup: 'rounded-2xl' }
        })
      }
    }
  }

  return (
    <div className="p-6 sm:p-8 bg-surface-50 min-h-screen animate-fade-in">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Gestión de Personal</h1>
          <p className="text-surface-500 mt-1 font-medium">Administra el personal y colaboradores</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              try {
                // Confirmación
                const result = await Swal.fire({
                  title: '¿Sincronizar con Entra ID?',
                  text: 'Esto actualizará usuarios, roles y sedes desde Azure. Puede tomar unos segundos.',
                  icon: 'info',
                  showCancelButton: true,
                  confirmButtonText: 'Sí, sincronizar',
                  cancelButtonText: 'Cancelar',
                  customClass: { popup: 'rounded-2xl' }
                });

                if (result.isConfirmed) {
                  // Loading state visual
                  Swal.fire({
                    title: 'Sincronizando...',
                    text: 'Por favor espere',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                    customClass: { popup: 'rounded-2xl' }
                  });

                  const response = await personalAPI.syncEntra();

                  if (response.success) {
                    Swal.fire({
                      title: '¡Sincronización Exitosa!',
                      html: `Procesados: ${response.stats?.processed || 0}<br>Actualizados: ${response.stats?.updated || 0}<br>Creados: ${response.stats?.created || 0}`,
                      icon: 'success',
                      customClass: { popup: 'rounded-2xl' }
                    });
                    reload(); // Recargar tabla
                    cargarEstadisticas(); // Recargar stats
                  } else {
                    throw new Error(response.error || 'Error desconocido');
                  }
                }
              } catch (err) {
                console.error('Error Sync:', err);
                Swal.fire({
                  title: 'Error',
                  text: err.message || 'No se pudo sincronizar',
                  icon: 'error',
                  customClass: { popup: 'rounded-2xl' }
                });
              }
            }}
            disabled={!canCreate('personal')} // Usamos permiso de crear como proxy para admin/infra
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all ${canCreate('personal')
                ? 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50 hover:text-primary-600'
                : 'bg-surface-100 text-surface-400 cursor-not-allowed'
              }`}
            title="Sincronizar manualmente con Microsoft Entra ID"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Entra ID
          </button>
          <button
            onClick={handleExportar}
            disabled={exportando}
            className="btn-secondary flex items-center gap-2 text-sm font-bold"
          >
            {exportando ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-surface-400 border-t-surface-600 rounded-full animate-spin"></div>
                Exportando...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar CSV
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/personal/crear')}
            disabled={!canCreate('personal')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-900/10 transition-all ${canCreate('personal')
              ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-900/20'
              : 'bg-surface-200 text-surface-400 cursor-not-allowed'
              }`}
            title={!canCreate('personal') ? 'No tienes permiso para crear personal' : ''}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Personal
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Personal"
            value={estadisticas.totalPersonal || estadisticas.resumen?.totalPersonal || 0}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Sedes Asignadas"
            value={estadisticas.totalSedesUnicas || estadisticas.resumen?.totalSedes || 0}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            color="emerald"
          />
          <StatCard
            title="Roles Activos"
            value={estadisticas.totalRolesUnicos || estadisticas.resumen?.totalRoles || 0}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            color="violet"
          />
        </div>
      )}

      {/* Buscador y Filtros */}
      <div className="card-base p-6 mb-8 bg-white border border-surface-200 shadow-sm">
        <form onSubmit={handleBuscar} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
              Buscar
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400 group-focus-within:text-primary-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Nombre, email, teléfono, dni..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 text-surface-900"
              />
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-surface-500 mb-1.5 uppercase tracking-wide">
              Empresa
            </label>
            <select
              value={empresaFiltro}
              onChange={(e) => setEmpresaFiltro(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-surface-900"
            >
              <option value="">Todas las empresas</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre_empresa}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-sm hover:shadow-md font-bold text-sm"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltro('')
                setEmpresaFiltro('')
                updateFilters({ search: '', empresa_id: '' })
              }}
              className="px-4 py-2.5 bg-white border border-surface-200 text-surface-600 rounded-xl hover:bg-surface-50 hover:text-surface-900 transition-colors font-medium text-sm"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Personal */}
      <div className="card-base bg-white border border-surface-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-surface-200 border-t-primary-600 mb-4"></div>
            <p className="text-surface-500 font-medium">Cargando personal...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50/50">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-rose-800 font-bold mb-1">Error al cargar personal</h3>
            <p className="text-rose-600 text-sm">{error}</p>
          </div>
        ) : personal.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4 text-surface-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-surface-900 font-medium text-lg">No se encontró personal</p>
            <p className="text-surface-500 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Personal
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Cargo / Rol
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-surface-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {personal.map((persona) => (
                  <tr key={persona.id} className="hover:bg-surface-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold shadow-sm border border-white">
                          {persona.nombre?.[0]}{persona.apellido?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-surface-900 text-sm">{persona.nombre} {persona.apellido}</p>
                          <p className="text-xs text-surface-500">{persona.empresa?.nombre_empresa || 'Sin empresa'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-sm text-surface-600">
                          <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {persona.email}
                        </div>
                        {persona.telefono && (
                          <div className="flex items-center gap-1.5 text-xs text-surface-500">
                            <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {persona.telefono}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-100 text-surface-600 border border-surface-200">
                        {persona.rol?.nombre || 'Sin Rol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">
                      {persona.sede ? (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {persona.sede.nombre_sede}
                        </div>
                      ) : (
                        <span className="text-surface-400 italic text-xs">Sin ubicación asignada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/personal/${persona.id}`)}
                          className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 group-hover:text-surface-600 rounded-lg transition-colors"
                          title="Ver Detalles"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {canUpdate('personal') && (
                          <button
                            onClick={() => navigate(`/personal/${persona.id}/editar`)}
                            className="p-1.5 text-surface-400 hover:text-amber-600 hover:bg-amber-50 group-hover:text-surface-600 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {canDelete('personal') && (
                          <button
                            onClick={() => eliminarPersona(persona)}
                            className="p-1.5 text-surface-400 hover:text-rose-600 hover:bg-rose-50 group-hover:text-surface-600 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {!loading && personal.length > 0 && (
        <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-surface-500">
            Mostrando <span className="font-bold text-surface-900">{getRecordRange(page, limit, totalRecords).start}</span> a <span className="font-bold text-surface-900">{getRecordRange(page, limit, totalRecords).end}</span> de <span className="font-bold text-surface-900">{totalRecords}</span> registros
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={previousPage}
              disabled={page === 1}
              className="p-2 border border-surface-200 rounded-lg bg-white text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="flex gap-1">
              {getPaginationNumbers(page, totalPages).map((num, i) =>
                num === '...' ? (
                  <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-surface-500">...</span>
                ) : (
                  <button
                    key={num}
                    onClick={() => goToPage(num)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${num === page
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                      }`}
                  >
                    {num}
                  </button>
                )
              )}
            </div>

            <button
              onClick={nextPage}
              disabled={page === totalPages}
              className="p-2 border border-surface-200 rounded-lg bg-white text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, color, icon }) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100'
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-200 flex items-center justify-between relative overflow-hidden group">
      <div className={`absolute right-0 top-0 w-24 h-24 -mr-4 -mt-4 rounded-full opacity-10 transition-transform group-hover:scale-110 ${colorStyles[color]?.split(' ')[0] || 'bg-surface-100'}`}></div>

      <div className="relative z-10">
        <p className="text-surface-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-surface-900 tracking-tight">{value}</p>
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${colorStyles[color] || 'bg-surface-100 text-surface-500'}`}>
        {icon}
      </div>
    </div>
  )
}
