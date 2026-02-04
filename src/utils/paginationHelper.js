/**
 * Genera un array de números de página para mostrar en la paginación
 * con puntos suspensivos (...) cuando hay muchas páginas
 *
 * @param {number} currentPage - Página actual (1-indexed)
 * @param {number} totalPages - Total de páginas
 * @param {number} maxVisible - Máximo de botones visibles (default: 5)
 * @returns {Array} Array con números de página y '...' donde corresponda
 *
 * Ejemplos:
 * - getPaginationNumbers(1, 3) => [1, 2, 3]
 * - getPaginationNumbers(5, 10) => [1, '...', 4, 5, 6, '...', 10]
 * - getPaginationNumbers(1, 10) => [1, 2, 3, '...', 10]
 */
export const getPaginationNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const numbers = []

  // Si hay pocas páginas, mostrar todas
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i)
    }
    return numbers
  }

  // Siempre mostrar la primera página
  numbers.push(1)

  // Agregar '...' si estamos lejos del inicio
  if (currentPage > 3) {
    numbers.push('...')
  }

  // Calcular el rango de páginas alrededor de la página actual
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    if (!numbers.includes(i)) {
      numbers.push(i)
    }
  }

  // Agregar '...' si estamos lejos del final
  if (currentPage < totalPages - 2) {
    numbers.push('...')
  }

  // Siempre mostrar la última página
  if (!numbers.includes(totalPages)) {
    numbers.push(totalPages)
  }

  return numbers
}

/**
 * Calcula el rango de registros que se están mostrando
 *
 * @param {number} page - Página actual
 * @param {number} limit - Items por página
 * @param {number} total - Total de registros
 * @returns {Object} { start, end } - Rango de registros (1-indexed)
 *
 * Ejemplo:
 * - getRecordRange(1, 10, 25) => { start: 1, end: 10 }
 * - getRecordRange(3, 10, 25) => { start: 21, end: 25 }
 */
export const getRecordRange = (page, limit, total) => {
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return { start, end }
}

/**
 * Valida si un número de página es válido
 *
 * @param {number} page - Número de página a validar
 * @param {number} totalPages - Total de páginas disponibles
 * @returns {boolean} true si la página es válida
 */
export const isValidPage = (page, totalPages) => {
  return Number.isInteger(page) && page >= 1 && page <= totalPages
}

/**
 * Componente de paginación reutilizable (opcional, pero útil)
 * Este es un helper que genera las props necesarias para renderizar paginación
 *
 * @param {Object} config - Configuración de paginación
 * @returns {Object} Props para renderizar componente de paginación
 */
export const getPaginationProps = ({
  page,
  totalPages,
  totalRecords,
  limit,
  onPageChange
}) => {
  const pageNumbers = getPaginationNumbers(page, totalPages)
  const { start, end } = getRecordRange(page, limit, totalRecords)

  return {
    pageNumbers,
    currentPage: page,
    totalPages,
    start,
    end,
    totalRecords,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    goToPage: (newPage) => {
      if (isValidPage(newPage, totalPages)) {
        onPageChange(newPage)
      }
    },
    goToPreviousPage: () => {
      if (page > 1) {
        onPageChange(page - 1)
      }
    },
    goToNextPage: () => {
      if (page < totalPages) {
        onPageChange(page + 1)
      }
    },
    goToFirstPage: () => onPageChange(1),
    goToLastPage: () => onPageChange(totalPages)
  }
}
