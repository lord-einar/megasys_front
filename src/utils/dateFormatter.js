// Utility functions for date formatting

export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getRelativeTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const seconds = Math.floor((now - d) / 1000)

  if (seconds < 60) return 'Hace unos segundos'
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`

  return formatDate(date)
}
