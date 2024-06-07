// src/index.js (o src/main.js si estás usando Vite)
import React from 'react';
import ReactDOM from 'react-dom/client'; // Asegúrate de importar createRoot desde 'react-dom/client'
import App from './App';
import './index.css'; // Asegúrate de que estás importando tus estilos

// Obtén el elemento root del DOM
const container = document.getElementById('root');

// Crea el root utilizando createRoot
const root = ReactDOM.createRoot(container);

// Renderiza la aplicación utilizando el nuevo root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


