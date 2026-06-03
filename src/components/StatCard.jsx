import { Building2, Users, Package, FileText, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

const ICON_MAP = {
  building: Building2,
  users: Users,
  package: Package,
  document: FileText,
}

function StatCard({ title, value, icon, trend, subtitle }) {
  const Icon = ICON_MAP[icon] || Building2

  const getTrendStyles = (trend) => {
    if (trend > 0) return 'text-emerald-700 bg-emerald-50 border-emerald-100'
    if (trend < 0) return 'text-rose-700 bg-rose-50 border-rose-100'
    return 'text-surface-500 bg-surface-50 border-surface-100'
  }

  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus

  return (
    <div className="card-base card-hover p-5 sm:p-6 group border-l-4 border-l-surface-200 hover:border-l-primary-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.04] transition-opacity transform translate-x-1/4 -translate-y-1/4">
        <Icon className="w-24 h-24 text-surface-900" strokeWidth={1.5} />
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-xs font-bold text-surface-400 mb-1.5 tracking-wider uppercase">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight tabular-nums">{value}</h3>
            {trend !== undefined && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTrendStyles(trend)} inline-flex items-center gap-0.5`}>
                <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
                {Math.abs(trend)}%
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
        <div className="p-3 bg-primary-50 rounded-lg text-primary-600 ring-1 ring-primary-100/80 group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600 transition-colors duration-150">
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

export default StatCard
