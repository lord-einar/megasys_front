/**
 * Utilidades para manejo de fechas
 * Soluciona problemas de timezone al convertir fechas
 */

/**
 * Obtiene la fecha local en formato YYYY-MM-DD sin conversión a UTC
 * Evita el bug de que new Date().toISOString() convierte a UTC causando cambio de día
 *
 * @param {Date} date - Fecha a formatear (por defecto: fecha actual)
 * @returns {string} Fecha en formato YYYY-MM-DD
 *
 * @example
 * getLocalDateString() // "2025-12-03"
 * getLocalDateString(new Date(2025, 11, 25)) // "2025-12-25"
 */
export const getLocalDateString = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Obtiene la fecha y hora local en formato ISO sin conversión a UTC
 *
 * @param {Date} date - Fecha a formatear (por defecto: fecha actual)
 * @returns {string} Fecha en formato YYYY-MM-DDTHH:mm
 *
 * @example
 * getLocalDateTimeString() // "2025-12-03T14:30"
 */
export const getLocalDateTimeString = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

/**
 * Formatea una fecha para mostrar al usuario en formato DD/MM/YYYY
 *
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha en formato DD/MM/YYYY
 *
 * @example
 * formatDateForDisplay("2025-12-03") // "03/12/2025"
 * formatDateForDisplay(new Date(2025, 11, 3)) // "03/12/2025"
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Parsea una fecha en formato YYYY-MM-DD a objeto Date en hora local
 * Evita el bug de que new Date(string) parsea como UTC
 *
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} Objeto Date en timezone local
 *
 * @example
 * parseLocalDate("2025-12-03") // Date en timezone local, no UTC
 */
export const parseLocalDate = (dateString) => {
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
