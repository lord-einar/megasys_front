import { getPaginationNumbers, getRecordRange } from '../utils/paginationHelper'

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
    <div className="px-4 sm:px-6 py-4 border-t border-surface-200 bg-surface-50 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-xs text-surface-500">
        Mostrando <span className="font-bold text-surface-900">{start}</span> a{' '}
        <span className="font-bold text-surface-900">{end}</span> de{' '}
        <span className="font-bold text-surface-900">{totalRecords}</span> registros
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={previousPage}
            disabled={page === 1}
            aria-label="Página anterior"
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
            aria-label="Página siguiente"
            className="p-2 border border-surface-200 rounded-lg bg-white text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}
