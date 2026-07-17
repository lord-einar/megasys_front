import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { inventarioAPI, tipoArticuloAPI, solicitudesCompraAPI, categoriaEquiposAsignacionAPI } from '../services/api'
import { usePermissions } from '../hooks/usePermissions'
import Swal from 'sweetalert2'
import LoadingOverlay from '../components/LoadingOverlay'
import { ArrowLeft, Smartphone, Laptop, Monitor } from 'lucide-react'

// Configuración por tipo de equipo. La clave coincide con el param de la ruta
// (/solicitudes-compra/ingreso/:tipo) y con el tipo_equipo lógico del backend.
const TIPO_CONFIG = {
  celular: {
    tipoArticuloNombre: 'Celular',
    categoriaTipo: 'celular',
    singular: 'celular',
    titulo: 'Ingresar celular nuevo',
    descripcion: 'Registrá un celular recién recibido en el stock de equipos',
    icon: Smartphone,
    mostrarImei: true,
    placeholderMarca: 'ej: Samsung',
    placeholderModelo: 'ej: Galaxy A55'
  },
  notebook: {
    tipoArticuloNombre: 'Notebook',
    categoriaTipo: 'notebook',
    singular: 'notebook',
    titulo: 'Ingresar notebook nueva',
    descripcion: 'Registrá una notebook recién recibida en el stock de equipos',
    icon: Laptop,
    mostrarImei: false,
    placeholderMarca: 'ej: Dell',
    placeholderModelo: 'ej: Latitude 5440'
  },
  pc_escritorio: {
    tipoArticuloNombre: 'PC',
    categoriaTipo: 'pc',
    singular: 'PC de escritorio',
    titulo: 'Ingresar PC de escritorio nueva',
    descripcion: 'Registrá una PC de escritorio recién recibida en el stock de equipos',
    icon: Monitor,
    mostrarImei: false,
    placeholderMarca: 'ej: HP',
    placeholderModelo: 'ej: ProDesk 400 G7'
  }
}

const schema = yup.object().shape({
  marca: yup.string().required('La marca es requerida').min(2, 'Mínimo 2 caracteres'),
  modelo: yup.string().required('El modelo es requerido').min(2, 'Mínimo 2 caracteres'),
  numero_serie: yup.string().nullable().notRequired(),
  imei: yup
    .string()
    .nullable()
    .notRequired()
    .matches(/^\d{15}$/, { message: 'El IMEI debe tener exactamente 15 dígitos', excludeEmptyString: true }),
  fecha_adquisicion: yup.date().nullable().notRequired().max(new Date(), 'La fecha no puede ser futura'),
  valor_adquisicion: yup
    .number()
    .nullable()
    .transform((v, o) => (o === '' ? null : v))
    .notRequired()
    .min(0, 'El valor no puede ser negativo'),
  observaciones: yup.string().nullable().notRequired(),
})

export default function IngresoCelularesPage() {
  const navigate = useNavigate()
  const { tipo: tipoParam } = useParams()
  // La ruta legacy /solicitudes-compra/ingreso-celular no pasa param -> celular.
  const tipo = TIPO_CONFIG[tipoParam] ? tipoParam : 'celular'
  const config = TIPO_CONFIG[tipo]
  const Icon = config.icon

  const { hasCompras, hasInfraestructura } = usePermissions()
  const canAccess = hasCompras || hasInfraestructura

  const [loading, setLoading] = useState(false)
  const [tipoArticuloId, setTipoArticuloId] = useState(null)
  const [sedes, setSedes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaId, setCategoriaId] = useState('')
  const [sedeId, setSedeId] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) })

  useEffect(() => {
    if (!canAccess) return

    // Buscar el TipoArticulo correspondiente (match exacto por nombre)
    tipoArticuloAPI.list({ limit: 100 })
      .then(res => {
        const tipos = res?.data || []
        const nombre = config.tipoArticuloNombre.toLowerCase()
        const encontrado = tipos.find(t => t.nombre?.toLowerCase() === nombre)
          || tipos.find(t => t.nombre?.toLowerCase().includes(nombre))
        if (encontrado) setTipoArticuloId(encontrado.id)
      })
      .catch(() => {})

    // Cargar sedes (lookup accesible para Compras, RRHH e Infraestructura)
    solicitudesCompraAPI.lookupSedes({ limit: 200 })
      .then(res => setSedes(res?.data || []))
      .catch(() => setSedes([]))

    // Cargar categorías del tipo
    categoriaEquiposAsignacionAPI.list({ tipo: config.categoriaTipo, activo: true })
      .then(res => setCategorias(res?.data || []))
      .catch(() => setCategorias([]))
  }, [canAccess, tipo])

  if (!canAccess) {
    return (
      <div className="page-shell">
        <p className="text-surface-500 text-center py-12">No tenés permisos para esta sección.</p>
      </div>
    )
  }

  const onSubmit = async (data) => {
    if (!tipoArticuloId) {
      Swal.fire('Error', `No se encontró el tipo de artículo "${config.tipoArticuloNombre}". Contactá a Infraestructura.`, 'error')
      return
    }

    const payload = {
      tipo_articulo_id: tipoArticuloId,
      marca: data.marca,
      modelo: data.modelo,
      numero_serie: data.numero_serie || null,
      imei: config.mostrarImei ? (data.imei || null) : null,
      fecha_adquisicion: data.fecha_adquisicion || null,
      valor_adquisicion: data.valor_adquisicion || null,
      observaciones: data.observaciones || null,
      categoria_id: categoriaId || null,
      sede_id: sedeId || null,
      estado: 'disponible',
    }

    setLoading(true)
    try {
      await inventarioAPI.create(payload)
      await Swal.fire({
        icon: 'success',
        title: 'Equipo ingresado',
        text: `${data.marca} ${data.modelo} fue agregado al stock correctamente.`,
        confirmButtonText: 'Ingresar otro',
        showCancelButton: true,
        cancelButtonText: 'Ver stock',
      }).then(result => {
        if (result.isConfirmed) {
          reset()
          setCategoriaId('')
          setSedeId('')
        } else {
          navigate('/solicitudes-compra/stock')
        }
      })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Error al guardar el equipo'
      Swal.fire('Error', msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (hasError) =>
    `w-full px-4 py-2.5 bg-surface-50 border ${hasError ? 'border-rose-400' : 'border-surface-200'} rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`

  const labelCls = 'block text-sm font-semibold text-surface-700 mb-1.5'

  return (
    <div className="page-shell">
      {loading && <LoadingOverlay />}

      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/solicitudes-compra/stock')}
            className="text-surface-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary-600" />
              {config.titulo}
            </h1>
            <p className="page-description">{config.descripcion}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">

        {/* Marca y modelo */}
        <div className="card-base p-6 space-y-4">
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider">Identificación del equipo</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Marca <span className="text-rose-500">*</span></label>
              <input {...register('marca')} placeholder={config.placeholderMarca} className={inputCls(errors.marca)} />
              {errors.marca && <p className="text-xs text-rose-500 mt-1">{errors.marca.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Modelo <span className="text-rose-500">*</span></label>
              <input {...register('modelo')} placeholder={config.placeholderModelo} className={inputCls(errors.modelo)} />
              {errors.modelo && <p className="text-xs text-rose-500 mt-1">{errors.modelo.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Número de serie</label>
              <input {...register('numero_serie')} placeholder="S/N del equipo" className={inputCls(errors.numero_serie)} />
              {errors.numero_serie && <p className="text-xs text-rose-500 mt-1">{errors.numero_serie.message}</p>}
            </div>
            {config.mostrarImei && (
              <div>
                <label className={labelCls}>IMEI</label>
                <input
                  {...register('imei')}
                  placeholder="15 dígitos"
                  maxLength={15}
                  className={inputCls(errors.imei)}
                />
                {errors.imei
                  ? <p className="text-xs text-rose-500 mt-1">{errors.imei.message}</p>
                  : <p className="text-xs text-surface-400 mt-1">Número de 15 dígitos del celular</p>
                }
              </div>
            )}
          </div>
        </div>

        {/* Categoría */}
        {categorias.length > 0 && (
          <div className="card-base p-6 space-y-4">
            <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider">Categoría del equipo</h2>
            <div>
              <label className={labelCls}>Categoría</label>
              <select
                value={categoriaId}
                onChange={e => setCategoriaId(e.target.value)}
                className={inputCls(false)}
              >
                <option value="">— Seleccioná la categoría —</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <p className="text-xs text-surface-400 mt-1">Perfil del equipo (Gerente, Ejecutivo, etc.)</p>
            </div>
          </div>
        )}

        {/* Destino */}
        <div className="card-base p-6 space-y-4">
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider">Destino</h2>
          <div>
            <label className={labelCls}>Sede de depósito</label>
            <select
              value={sedeId}
              onChange={e => setSedeId(e.target.value)}
              className={inputCls(false)}
            >
              <option value="">— Sin sede asignada —</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre_sede}</option>
              ))}
            </select>
            <p className="text-xs text-surface-400 mt-1">Dónde quedará almacenado el equipo</p>
          </div>
        </div>

        {/* Compra */}
        <div className="card-base p-6 space-y-4">
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider">Datos de compra</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Fecha de adquisición</label>
              <input
                type="date"
                {...register('fecha_adquisicion')}
                className={inputCls(errors.fecha_adquisicion)}
              />
              {errors.fecha_adquisicion && <p className="text-xs text-rose-500 mt-1">{errors.fecha_adquisicion.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Valor de adquisición ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('valor_adquisicion')}
                placeholder="0.00"
                className={inputCls(errors.valor_adquisicion)}
              />
              {errors.valor_adquisicion && <p className="text-xs text-rose-500 mt-1">{errors.valor_adquisicion.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Observaciones</label>
            <textarea
              {...register('observaciones')}
              rows={3}
              placeholder="Accesorios incluidos, condición del equipo, notas de la compra…"
              className={`${inputCls(errors.observaciones)} resize-none`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/solicitudes-compra/stock')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-accent"
          >
            <Icon className="w-4 h-4" />
            Registrar {config.singular}
          </button>
        </div>
      </form>
    </div>
  )
}
