import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPaginationNumbers, getRecordRange } from '../utils/paginationHelper'

const botonBase =
  'inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-2 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40'

/**
 * Paginador de listados. Se apoya en los valores que expone useListData.
 * No se renderiza si no hay registros.
 */
export default function ListPagination({
  page,
  limit,
  totalPages,
  totalRecords,
  goToPage,
  previousPage,
  nextPage
}) {
  if (!totalRecords) return null

  const { start, end } = getRecordRange(page, limit, totalRecords)

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-col items-center justify-between gap-3 border-t border-surface-200 bg-surface-50 px-4 py-3 sm:flex-row sm:px-6"
    >
      <p className="text-sm text-surface-600">
        Mostrando <span className="font-semibold text-surface-900">{start}–{end}</span> de{' '}
        <span className="font-semibold text-surface-900">{totalRecords}</span>
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousPage}
            disabled={page === 1}
            aria-label="Página anterior"
            className={`${botonBase} border-field bg-white text-surface-800 hover:bg-surface-100`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* En pantallas chicas, el texto reemplaza a la fila de números */}
          <span className="px-2 text-sm font-semibold text-surface-800 sm:hidden">
            Página {page} de {totalPages}
          </span>

          <ul className="hidden gap-1 sm:flex">
            {getPaginationNumbers(page, totalPages).map((num, i) =>
              num === '...' ? (
                <li key={`dots-${i}`} className="flex h-10 w-8 items-center justify-center text-surface-500" aria-hidden="true">…</li>
              ) : (
                <li key={num}>
                  <button
                    type="button"
                    onClick={() => goToPage(num)}
                    aria-current={num === page ? 'page' : undefined}
                    aria-label={`Página ${num}`}
                    className={`${botonBase} ${num === page
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-surface-200 bg-white text-surface-800 hover:bg-surface-100'
                      }`}
                  >
                    {num}
                  </button>
                </li>
              )
            )}
          </ul>

          <button
            type="button"
            onClick={nextPage}
            disabled={page === totalPages}
            aria-label="Página siguiente"
            className={`${botonBase} border-field bg-white text-surface-800 hover:bg-surface-100`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  )
}
