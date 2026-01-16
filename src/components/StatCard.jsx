import {
  BuildingIcon,
  UsersIcon,
  PackageIcon,
  DocumentIcon
} from './Icons'

function StatCard({ title, value, icon, trend, subtitle }) {
  // Función para obtener el componente de icono
  const getIconComponent = () => {
    const iconClass = "w-6 h-6 text-primary-600"
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
    if (trend > 0) return 'text-success-600 bg-success-50'
    if (trend < 0) return 'text-error-600 bg-error-50'
    return 'text-slate-500 bg-slate-50'
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↗'
    if (trend < 0) return '↘'
    return '→'
  }

  return (
    <div className="card-base p-6 hover:shadow-md transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-primary-500">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1 tracking-wide uppercase text-xs">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-navy-900 tracking-tight">{value}</p>
            {trend !== undefined && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getTrendColor(trend)} flex items-center gap-1`}>
                {getTrendIcon(trend)} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-primary-50 rounded-xl group-hover:scale-110 group-hover:bg-primary-100 transition-all duration-200 shadow-sm">
          {getIconComponent()}
        </div>
      </div>
    </div>
  )
}

export default StatCard