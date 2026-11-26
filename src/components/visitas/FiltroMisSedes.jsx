import { MapPin } from 'lucide-react';

/**
 * Interruptor "Solo mis sedes" (super_admin con sedes asignadas) o aviso fijo
 * (técnico restringido a sus sedes). No muestra nada si el usuario ve todo.
 */
const FiltroMisSedes = ({ forzado, puedeFiltrar, soloMisSedes, onChange, cantidadSedes }) => {
    if (forzado) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Tus {cantidadSedes} sedes asignadas
            </span>
        );
    }

    if (!puedeFiltrar) return null;

    return (
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={soloMisSedes}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            Solo mis sedes ({cantidadSedes})
        </label>
    );
};

export default FiltroMisSedes;
