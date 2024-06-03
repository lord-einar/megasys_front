// src/services/axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://tu-backend-api.com/api', // Cambia esto por la URL de tu backend
  timeout: 1000,
});

export default instance;
