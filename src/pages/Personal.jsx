// src/pages/Personal.jsx
import React, { useState, useEffect } from 'react';
import axios from '../services/axiosConfig';
import { showLoadingAlert, showSuccessAlert, showErrorAlert } from '../utils/AlertUtils'; // Asegúrate de que esta ruta sea correcta
import PersonalModal from '../components/PersonalModal';

const Personal = () => {
  const [personas, setPersonas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    fetchPersonas();
    fetchRolesAndSedes();
  }, []);

  const fetchPersonas = async () => {
    try {
      const [personasResponse, sedepersonaResponse] = await Promise.all([
        axios.get('/personas'),
        axios.get('/sedepersona')
      ]);

      const personasData = personasResponse.data;
      const sedepersonaData = sedepersonaResponse.data;

      const personasConSedeYRol = personasData.map(persona => {
        const sedePersona = sedepersonaData.find(sp => sp.Persona.id_persona === persona.id_persona) || {};
        return {
          ...persona,
          rol: sedePersona.Rol ? sedePersona.Rol.nombre : 'N/A',
          sede: sedePersona.Sede ? sedePersona.Sede.nombre : 'N/A',
          id_sedePersona: sedePersona.id_sedePersona || null
        };
      });

      setPersonas(personasConSedeYRol);

    } catch (error) {
      console.error('Error al obtener las personas', error);
    }
  };

  const fetchRolesAndSedes = async () => {
    try {
      const [rolesResponse, sedesResponse] = await Promise.all([
        axios.get('/roles'),
        axios.get('/sedes')
      ]);
      setRoles(rolesResponse.data);
      setSedes(sedesResponse.data);
    } catch (error) {
      console.error('Error al obtener roles y sedes', error);
    }
  };

  const handleDelete = async (id_persona) => {
    showLoadingAlert();
    try {
      await axios.delete(`/personas/${id_persona}`);
      showSuccessAlert('La persona ha sido eliminada correctamente');
      fetchPersonas();
    } catch (error) {
      showErrorAlert('Hubo un problema al eliminar la persona');
      console.error('Error al eliminar la persona', error);
    }
  };

  const handleOpenModal = (persona = null) => {
    setSelectedPersona(persona);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPersona(null);
    setModalOpen(false);
    fetchPersonas();
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Personal</h1>
      <button
        onClick={() => handleOpenModal()}
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
      >
        Agregar Personal
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Nombre</th>
            <th className="py-2">Email</th>
            <th className="py-2">Teléfono</th>
            <th className="py-2">Rol</th>
            <th className="py-2">Sede</th>
            <th className="py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {personas.map(({ id_persona, nombre, email, telefono, rol, sede, id_sedePersona }) => (
            <tr key={id_persona}>
              <td className="border px-4 py-2">{nombre}</td>
              <td className="border px-4 py-2">{email}</td>
              <td className="border px-4 py-2">{telefono}</td>
              <td className="border px-4 py-2">{rol}</td>
              <td className="border px-4 py-2">{sede}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleOpenModal({ id_persona, nombre, email, telefono, id_rol: rol, id_sede: sede })}
                  className="bg-yellow-500 text-white py-1 px-2 rounded mr-2"
                >
                  Modificar
                </button>
                <button
                  onClick={() => handleDelete(id_persona)}
                  className="bg-red-500 text-white py-1 px-2 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalOpen && (
        <PersonalModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          persona={selectedPersona}
          roles={roles}
          sedes={sedes}
        />
      )}
    </div>
  );
};

export default Personal;
