import { useState, useCallback } from 'react'

/**
 * Hook para validación en tiempo real de campos
 * @param {Object} validationSchema - Schema de Yup para validar
 * @param {string} fieldName - Nombre del campo a validar
 * @returns {Object} - { isValid, error, validate, clearError }
 */
export const useFieldValidation = (validationSchema, fieldName) => {
  const [isValid, setIsValid] = useState(null)
  const [error, setError] = useState(null)

  const validate = useCallback(
    async (value) => {
      try {
        // Validar solo el campo específico
        await validationSchema.fields[fieldName].validate(value)
        setIsValid(true)
        setError(null)
        return true
      } catch (err) {
        setIsValid(false)
        setError(err.message)
        return false
      }
    },
    [validationSchema, fieldName]
  )

  const clearError = useCallback(() => {
    setIsValid(null)
    setError(null)
  }, [])

  return {
    isValid,
    error,
    validate,
    clearError
  }
}
