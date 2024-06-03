// src/pages/SedesCrear.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from '../services/axiosConfig';
import { Form, Button } from 'react-bootstrap';

const schema = yup.object().shape({
  nombre: yup.string().required('El nombre es obligatorio'),
  direccion: yup.string().required('La dirección es obligatoria'),
});

const SedesCrear = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = data => {
    axios.post('/sede', data)
      .then(response => {
        console.log('Sede creada', response.data);
      })
      .catch(error => {
        console.error('Error al crear la sede', error);
      });
  };

  return (
    <div>
      <h2>Crear Sede</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group controlId="nombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control type="text" placeholder="Nombre de la sede" {...register('nombre')} />
          {errors.nombre && <p>{errors.nombre.message}</p>}
        </Form.Group>

        <Form.Group controlId="direccion">
          <Form.Label>Dirección</Form.Label>
          <Form.Control type="text" placeholder="Dirección de la sede" {...register('direccion')} />
          {errors.direccion && <p>{errors.direccion.message}</p>}
        </Form.Group>

        <Button variant="primary" type="submit">
          Crear Sede
        </Button>
      </Form>
    </div>
  );
};

export default SedesCrear;
