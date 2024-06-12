// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 transition-transform duration-200 ease-in-out bg-gray-800 text-white w-64`}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold">GRUPO MEGATLON</h1>
      </div>
      <nav className="mt-10">
        <Link
          to="/dashboard"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
        >
          Dashboard
        </Link>
        <Link
          to="/sedes"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
        >
          Sedes
        </Link>
        <Link
          to="/personal"
          className="block py-2 px-4 rounded hover:bg-gray-700"
        >
          Personal
        </Link>
        <Link
          to="/inventario"
          className="block py-2 px-4 rounded hover:bg-gray-700"
        >
          Inventario
        </Link>
        <Link
          to="/remitos"
          className="block py-2 px-4 rounded hover:bg-gray-700"
        >
          Remitos
        </Link>
      </nav>
      <button
        className="md:hidden absolute top-4 right-4 text-white"
        onClick={() => setSidebarOpen(false)}
      >
        ✕
      </button>
    </div>
  );
};

export default Sidebar;
