import { 
  BuildingIcon, 
  UsersIcon, 
  PackageIcon, 
  DocumentIcon 
} from './Icons'

function StatCard({ title, value, icon, trend, subtitle }) {
  // Función para obtener el componente de icono
  const getIconComponent = () => {
    switch (icon) {
      case 'building':
        return <BuildingIcon className="w-6 h-6 text-blue-600" />
      case 'users':
        return <UsersIcon className="w-6 h-6 text-blue-600" />
      case 'package':
        return <PackageIcon className="w-6 h-6 text-blue-600" />
      case 'document':
        return <DocumentIcon className="w-6 h-6 text-blue-600" />
      default:
        return <BuildingIcon className="w-6 h-6 text-blue-600" />
    }
  }

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600 bg-green-50'
    if (trend < 0) return 'text-red-600 bg-red-50'
    return 'text-gray-500 bg-gray-50'
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↗'
    if (trend < 0) return '↘'
    return '→'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTrendColor(trend)} flex items-center gap-1`}>
                {getTrendIcon(trend)} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
          {getIconComponent()}
        </div>
      </div>
    </div>
  )
}

export default StatCard