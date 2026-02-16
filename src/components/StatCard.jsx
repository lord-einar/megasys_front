import {
  BuildingIcon,
  UsersIcon,
  PackageIcon,
  DocumentIcon
} from './Icons'

function StatCard({ title, value, icon, trend, subtitle }) {
  // Función para obtener el componente de icono
  const getIconComponent = () => {
    const iconClass = "w-6 h-6 text-primary-600 transition-transform group-hover:scale-110 duration-300"
    switch (icon) {
      case 'building':
        return <BuildingIcon className={iconClass} />
      case 'users':
        return <UsersIcon className={iconClass} />
      case 'package':
        return <PackageIcon className={iconClass} />
      case 'document':
        return <DocumentIcon className={iconClass} />
      default:
        return <BuildingIcon className={iconClass} />
    }
  }

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    if (trend < 0) return 'text-rose-600 bg-rose-50 border-rose-100'
    return 'text-surface-500 bg-surface-50 border-surface-100'
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↗'
    if (trend < 0) return '↘'
    return '→'
  }

  return (
    <div className="card-base p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border-l-4 border-l-transparent hover:border-l-primary-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-1/4 -translate-y-1/4">
        {getIconComponent()}
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs font-bold text-surface-400 mb-1.5 tracking-wider uppercase">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">{value}</h3>
            {trend !== undefined && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTrendColor(trend)} flex items-center gap-0.5`}>
                {getTrendIcon(trend)} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-surface-400 mt-2 font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-surface-300"></span>
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-xl shadow-sm text-primary-600 ring-1 ring-primary-100/50 group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600 transition-all duration-300">
          {getIconComponent()}
        </div>
      </div>
    </div>
  )
}

export default StatCard