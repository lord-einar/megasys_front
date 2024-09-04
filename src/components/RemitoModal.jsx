// src/components/RemitoModal.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils';

const RemitoModal = ({ isOpen, onClose, remito, isViewMode }) => {
  const [sedes, setSedes] = useState([]);
  const [inventarios, setInventarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tipoArticulo, setTipoArticulo] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [formData, setFormData] = useState({
    id_sede: '',
    solicitante: '',
    transportista: '',
    fecha_remito: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    inventario: [{ id_inventario: '', es_prestamo: false, fecha_devolucion: '' }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sedesResponse, inventariosResponse, personasResponse, usuariosResponse, tipoArticuloResponse, marcasResponse] = await Promise.all([
          axios.get('/sedes'),
          axios.get('/inventario'),
          axios.get('/personas'),
          axios.get('/users'),
          axios.get('/tipo_articulo'),
          axios.get('/marcas')
        ]);
        console.log(tipoArticuloResponse.data)

        setSedes(sedesResponse.data);
        setInventarios(inventariosResponse.data.filter(inventario => inventario.id_sede === 'd8bf1659-92d4-4d43-ba7f-e2b2d63e6fdc'));
        setPersonas(personasResponse.data);
        setUsuarios(usuariosResponse.data);
        setTipoArticulo(tipoArticuloResponse.data);
        setMarcas(marcasResponse.data);
      } catch (error) {
        console.error('Error al obtener los datos', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (remito) {
      setFormData(remito);
    }
  }, [remito]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('inventario')) {
      const [_, index, field] = name.split('.');
      const updatedInventario = formData.inventario.map((item, i) => {
        if (i === parseInt(index)) {
          return { ...item, [field]: type === 'checkbox' ? checked : value };
        }
        return item;
      });
      setFormData({ ...formData, inventario: updatedInventario });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoadingAlert();

    const personaSolicitante = personas.find(persona => persona.id_persona === formData.solicitante);
    const data = { ...formData, solicitante_email: personaSolicitante ? personaSolicitante.email : '' };

    try {
      if (remito) {
        await axios.put(`/remitos/${remito.id_remito}`, data);
        showSuccessAlert('El remito ha sido modificado correctamente');
      } else {
        await axios.post('/remitos', data);
        showSuccessAlert('El remito ha sido creado correctamente');
      }
      setFormData({
        id_sede: '',
        solicitante: '',
        transportista: '',
        fecha_remito: new Date().toISOString().split('T')[0],
        inventario: [{ id_inventario: '', es_prestamo: false, fecha_devolucion: '' }]
      });
      onClose();
    } catch (error) {
      showErrorAlert('Hubo un problema al crear o modificar el remito');
      console.error('Error al crear o modificar el remito', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <h2 className="text-2xl font-bold mb-4">{remito ? (isViewMode ? 'Ver Remito' : 'Modificar Remito') : 'Crear Remito'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sede</label>
              <select
                name="id_sede"
                value={formData.id_sede}
                onChange={handleChange}
                disabled={isViewMode}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">--Seleccione sede--</option>
                {sedes.map(sede => (
                  <option key={sede.id_sede} value={sede.id_sede}>{sede.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Solicitante</label>
              <select
                name="solicitante"
                value={formData.solicitante}
                onChange={handleChange}
                disabled={isViewMode}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">--Seleccione solicitante--</option>
                {personas.map(persona => (
                  <option key={persona.id_persona} value={persona.id_persona}>{persona.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                name="fecha_remito"
                value={formData.fecha_remito}
                onChange={handleChange}
                disabled={isViewMode || !!remito}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Técnico responsable</label>
              <select
                name="transportista"
                value={formData.transportista}
                onChange={handleChange}
                disabled={isViewMode}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">--Seleccione técnico--</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id_user} value={usuario.id_user}>{usuario.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Equipos</h3>
            {formData.inventario.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de equipo</label>
                  <select
                    name={`inventario.${index}.id_tipoArticulo`}
                    value={item.id_tipoArticulo}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  >
                    <option value="">--Seleccione tipo--</option>
                    {tipoArticulo.map(tipo => (
                      <option key={tipo.id_tipo_articulo} value={tipo.id_tipo_articulo}>{tipo.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marca</label>
                  <select
                    name={`inventario.${index}.id_marca`}
                    value={item.id_marca}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  >
                    <option value="">--Seleccione marca--</option>
                    {marcas.map(marca => (
                      <option key={marca.id_marca} value={marca.id_marca}>{marca.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Equipo</label>
                  <select
                    name={`inventario.${index}.id_inventario`}
                    value={item.id_inventario}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                  >
                    <option value="">--Seleccione equipo--</option>
                    {inventarios.map(inventario => (
                      <option key={inventario.id_inventario} value={inventario.id_inventario}>{inventario.marca} - {inventario.modelo}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name={`inventario.${index}.es_prestamo`}
                    checked={item.es_prestamo}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">Préstamo</label>
                </div>
                {item.es_prestamo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Devolución</label>
                    <input
                      type="date"
                      name={`inventario.${index}.fecha_devolucion`}
                      value={item.fecha_devolucion}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                    />
                  </div>
                )}
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={() => {
                      const newInventario = formData.inventario.filter((_, i) => i !== index);
                      setFormData({ ...formData, inventario: newInventario });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
            {!isViewMode && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, inventario: [...formData.inventario, { id_inventario: '', es_prestamo: false, fecha_devolucion: '' }] })}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Añadir Equipo
              </button>
            )}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded mr-2">
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isViewMode && (
              <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                {remito ? 'Modificar' : 'Crear'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemitoModal;
