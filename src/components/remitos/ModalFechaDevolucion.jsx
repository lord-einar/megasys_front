import { useState, useEffect } from 'react'
import './ModalFechaDevolucion.css'

/**
 * ModalFechaDevolucion - Modal con calendario para seleccionar fecha de devolución
 *
 * Props:
 * - isOpen: boolean - controla visibilidad del modal
 * - onClose: función - cierra el modal
 * - onSelectDate: función - callback cuando se selecciona una fecha
 * - currentDate: fecha actual del artículo (o null)
 * - minDate: fecha mínima permitida (default: hoy + 1 día)
 */
function ModalFechaDevolucion({
  isOpen,
  onClose,
  onSelectDate,
  currentDate,
  minDate
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [displayMonth, setDisplayMonth] = useState(new Date())

  useEffect(() => {
    if (isOpen) {
      // Establecer la fecha inicial
      if (currentDate) {
        setSelectedDate(new Date(currentDate))
        setDisplayMonth(new Date(currentDate))
      } else {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        setSelectedDate(tomorrow)
        setDisplayMonth(tomorrow)
      }
    }
  }, [isOpen, currentDate])

  const getMinDate = () => {
    if (minDate) return new Date(minDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateDisabled = (date) => {
    const minDate = getMinDate()
    minDate.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return date < minDate
  }

  const isDateSelected = (date) => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  const handlePrevMonth = () => {
    setDisplayMonth(
      new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1)
    )
  }

  const handleNextMonth = () => {
    setDisplayMonth(
      new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1)
    )
  }

  const handleSelectDate = (day) => {
    const selected = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth(),
      day
    )
    if (!isDateDisabled(selected)) {
      setSelectedDate(selected)
    }
  }

  const handleConfirm = () => {
    if (selectedDate) {
      // Formatear fecha como YYYY-MM-DD para backend
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const isoDate = `${year}-${month}-${day}`
      onSelectDate(isoDate)
      onClose()
    }
  }

  const handleToday = () => {
    const today = new Date()
    // Ajustar para evitar problemas de timezone
    today.setHours(0, 0, 0, 0)
    if (!isDateDisabled(today)) {
      setSelectedDate(new Date(today))
    }
  }

  const handleTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (!isDateDisabled(tomorrow)) {
      setSelectedDate(new Date(tomorrow))
    }
  }

  const handleNextWeek = () => {
    const nextWeek = new Date()
    nextWeek.setHours(0, 0, 0, 0)
    nextWeek.setDate(nextWeek.getDate() + 7)
    if (!isDateDisabled(nextWeek)) {
      setSelectedDate(new Date(nextWeek))
    }
  }

  const daysInMonth = getDaysInMonth(displayMonth)
  const firstDay = getFirstDayOfMonth(displayMonth)
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab']
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-fecha" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Seleccionar Fecha de Devolución</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Quick selection buttons */}
          <div className="quick-select">
            <button
              className="quick-btn"
              onClick={handleToday}
              disabled={isDateDisabled(new Date())}
            >
              Hoy
            </button>
            <button
              className="quick-btn"
              onClick={handleTomorrow}
              disabled={(() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                return isDateDisabled(tomorrow)
              })()}
            >
              Mañana
            </button>
            <button
              className="quick-btn"
              onClick={handleNextWeek}
              disabled={(() => {
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                return isDateDisabled(nextWeek)
              })()}
            >
              Próxima semana
            </button>
          </div>

          {/* Calendar */}
          <div className="calendar">
            {/* Month/Year header */}
            <div className="calendar-header">
              <button
                className="nav-btn"
                onClick={handlePrevMonth}
                aria-label="Mes anterior"
              >
                ‹
              </button>
              <h4 className="month-year">
                {monthNames[displayMonth.getMonth()]} {displayMonth.getFullYear()}
              </h4>
              <button
                className="nav-btn"
                onClick={handleNextMonth}
                aria-label="Mes siguiente"
              >
                ›
              </button>
            </div>

            {/* Day labels */}
            <div className="calendar-weekdays">
              {dayLabels.map((day) => (
                <div key={day} className="weekday-label">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="calendar-days">
              {Array(firstDay)
                .fill(null)
                .map((_, index) => (
                  <div key={`empty-${index}`} className="calendar-day empty"></div>
                ))}

              {Array(daysInMonth)
                .fill(null)
                .map((_, index) => {
                  const day = index + 1
                  const date = new Date(
                    displayMonth.getFullYear(),
                    displayMonth.getMonth(),
                    day
                  )
                  const disabled = isDateDisabled(date)
                  const selected = isDateSelected(date)
                  const isToday =
                    date.toDateString() === new Date().toDateString()

                  return (
                    <button
                      key={day}
                      className={`calendar-day ${selected ? 'selected' : ''} ${
                        isToday ? 'today' : ''
                      } ${disabled ? 'disabled' : ''}`}
                      onClick={() => handleSelectDate(day)}
                      disabled={disabled}
                      aria-label={`${day} de ${monthNames[displayMonth.getMonth()]}`}
                    >
                      {day}
                    </button>
                  )
                })}
            </div>
          </div>

          {/* Selected date display */}
          {selectedDate && (
            <div className="selected-date-display">
              <strong>Fecha seleccionada:</strong>{' '}
              {(() => {
                const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][selectedDate.getDay()]
                const monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][selectedDate.getMonth()]
                const day = String(selectedDate.getDate()).padStart(2, '0')
                const year = selectedDate.getFullYear()
                return `${dayName}, ${day} de ${monthName} de ${year}`
              })()}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!selectedDate}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalFechaDevolucion
