// Espejo (solo UI) de megasys_back/src/shared/constants/tipoEquipo.js
// La autoridad es el backend; mantener ambos en sync ante cambios.

// tipo_equipo de la solicitud -> tipo de categoría. Difieren sólo en la PC:
// la solicitud la llama 'pc_escritorio' y la categoría 'pc'.
export const TIPO_EQUIPO_TO_CATEGORIA_TIPO = {
  celular: 'celular',
  notebook: 'notebook',
  pc_escritorio: 'pc'
}

// Categoría que aplica a los tres tipos. El valor quedó como 'ambos' de cuando
// había sólo dos tipos; en la UI se muestra como "Todos los tipos".
export const CATEGORIA_TIPO_TODOS = 'ambos'

export const CATEGORIA_TIPOS = ['notebook', 'celular', 'pc', CATEGORIA_TIPO_TODOS]

export const CATEGORIA_TIPO_LABELS = {
  notebook: 'Notebook',
  celular: 'Celular',
  pc: 'PC de escritorio',
  [CATEGORIA_TIPO_TODOS]: 'Todos los tipos'
}

/** Tipo de categoría a partir del tipo_equipo de una solicitud. */
export const categoriaTipoDeSolicitud = (tipoEquipo) =>
  TIPO_EQUIPO_TO_CATEGORIA_TIPO[tipoEquipo] || null

/**
 * Tipo de categoría a partir del nombre del TipoArticulo de inventario.
 * Contempla que en la base convivan "Notebook" y "Notebooks".
 * @returns {string|null} 'celular' | 'notebook' | 'pc', o null si el artículo
 *   no es un equipo asignable (monitor, impresora, etc.).
 */
export function categoriaTipoDeArticulo(nombreTipoArticulo) {
  const nombre = (nombreTipoArticulo || '').toLowerCase().trim()
  if (!nombre) return null
  if (nombre.includes('cel')) return 'celular'
  if (nombre.includes('notebook')) return 'notebook'
  // El TipoArticulo de escritorio se llama exactamente "PC".
  if (nombre === 'pc') return 'pc'
  return null
}
