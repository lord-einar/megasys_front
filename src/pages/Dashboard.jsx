// src/pages/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-medium">Clientes</h2>
          <p className="text-2xl">1456</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-medium">Ingresos</h2>
          <p className="text-2xl">$3,345</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-medium">Ganancias</h2>
          <p className="text-2xl">60%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-medium">Facturas</h2>
          <p className="text-2xl">1135</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
