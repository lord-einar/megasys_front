import { useState, useMemo } from 'react'

/**
 * Hook para manejar paginación con generación automática de números de página
 * @param {number} initialPage - Página inicial (default: 1)
 * @param {number} initialLimit - Items por página (default: 10)
 * @param {number} maxVisible - Máximo de números de página visibles (default: 5)
 * @returns {object} Objeto con estado y funciones de paginación
 */
export function usePagination(initialPage = 1, initialLimit = 10, maxVisible = 5) {
  const [page, setPage] = useState(initialPage)
  const [limit] = useState(initialLimit)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  /**
   * Genera array de números de página para mostrar
   * Incluye lógica para mostrar '...' cuando hay muchas páginas
   */
  const pageNumbers = useMemo(() => {
    const numbers = []

    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        numbers.push(i)
      }
    } else {
      // Lógica compleja para páginas con '...'
      numbers.push(1)

      if (page > 3) numbers.push('...')

      const inicio = Math.max(2, page - 1)
      const fin = Math.min(totalPages - 1, page + 1)

      for (let i = inicio; i <= fin; i++) {
        if (!numbers.includes(i)) numbers.push(i)
      }

      if (page < totalPages - 2) numbers.push('...')

      if (!numbers.includes(totalPages)) {
        numbers.push(totalPages)
      }
    }

    return numbers
  }, [page, totalPages, maxVisible])

  /**
   * Navega a la página anterior
   */
  const goToPreviousPage = () => {
    setPage(prev => Math.max(1, prev - 1))
  }

  /**
   * Navega a la página siguiente
   */
  const goToNextPage = () => {
    setPage(prev => Math.min(totalPages, prev + 1))
  }

  /**
   * Navega a una página específica
   */
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber)
    }
  }

  /**
   * Resetea la paginación a la primera página
   */
  const resetPage = () => {
    setPage(1)
  }

  /**
   * Actualiza el total de páginas basado en el total de registros
   */
  const updatePagination = (total) => {
    setTotalRecords(total)
    const calculatedPages = Math.max(1, Math.ceil(total / limit))
    setTotalPages(calculatedPages)
  }

  return {
    // Estado
    page,
    limit,
    totalPages,
    totalRecords,
    pageNumbers,

    // Funciones
    setPage,
    setTotalPages,
    goToPreviousPage,
    goToNextPage,
    goToPage,
    resetPage,
    updatePagination,

    // Flags útiles
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
    hasPages: totalPages > 1
  }
}
