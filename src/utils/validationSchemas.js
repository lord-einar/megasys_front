// src/utils/validationSchemas.js
import * as yup from 'yup';

export const personaSchema = yup.object().shape({
  nombre: yup.string().required('El nombre es obligatorio'),
  email: yup.string().email('Debe ser un email válido').required('El email es obligatorio'),
  telefono: yup.string().required('El teléfono es obligatorio'),
  id_rol: yup.string().required('El rol es obligatorio'),
  id_sede: yup.string().required('La sede es obligatoria'),
});


export const sedeSchema = yup.object().shape({
  id_empresa: yup.string().required('La empresa es obligatoria'),
  nombre: yup.string().required('El nombre es obligatorio'),
  direccion: yup.string().required('La dirección es obligatoria'),
  localidad: yup.string().required('La localidad es obligatoria'),
  provincia: yup.string().required('La provincia es obligatoria'),
  pais: yup.string().required('El país es obligatorio'),
  telefono: yup.string().required('El teléfono es obligatorio'),
  email: yup.string().email('Debe ser un email válido').required('El email es obligatorio'),
  ip_asignada: yup.string().required('La IP asignada es obligatoria'),
});

export const inventarioSchema = yup.object().shape({
  marca: yup.string().required('La marca es obligatoria'),
  modelo: yup.string().required('El modelo es obligatorio'),
  tipo_articulo: yup.string().required('El tipo de artículo es obligatorio'),
  service_tag: yup.string(),
  num_serie: yup.string(),
});

export const remitoSchema = yup.object().shape({
  id_sede: yup.string().required('La sede es obligatoria'),
  solicitante: yup.string().required('El solicitante es obligatorio'),
  fecha_remito: yup.date().required('La fecha es obligatoria'),
  transportista: yup.string().required('El transportista es obligatorio'),
  equipos: yup.array().of(
    yup.object().shape({
      id_inventario: yup.string().required('El equipo es obligatorio'),
      es_prestamo: yup.boolean()
    })
  ).min(1, 'Debe agregar al menos un equipo')
});


