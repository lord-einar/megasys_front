import React, { useState, useEffect } from "react";
import "./Tabs.css";
import PersonalSede from "./PersonalSede";
import ServiciosSede from "./ServiciosSede";
import InventarioSede from "./InventarioSede";

const Tabs = ({ personas, servicios, inventarios }) => {
  console.log(personas);
  const [activeTab, setActiveTab] = useState("tab1");

  useEffect(() => {
    showTab(activeTab);
  }, [activeTab]);

  const showTab = (tabId) => {
    // Ocultar todo el contenido de las pestañas
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
      content.classList.add("hidden");
    });

    // Mostrar el contenido de la pestaña seleccionada
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.remove("hidden");
    }
  };

  return (
    <>
      <div className="w-full mt-20">
        <div className="bg-gray-500 p-2 rounded-t-lg">
          <div className="flex justify-center space-x-4">
            <button
              className={`px-4 py-2 text-white font-semibold border-b-4 border-gray-700 hover:bg-gray-700 focus:outline-none tab-button ${
                activeTab === "tab1" ? "active" : ""
              }`}
              onClick={() => setActiveTab("tab1")}
            >
              Servicios
            </button>
            <button
              className={`px-4 py-2 text-white font-semibold border-b-4 border-gray-700 hover:bg-gray-700 focus:outline-none tab-button ${
                activeTab === "tab2" ? "active" : ""
              }`}
              onClick={() => setActiveTab("tab2")}
            >
              Personas
            </button>
            <button
              className={`px-4 py-2 text-white font-semibold border-b-4 border-gray-700 hover:bg-gray-700 focus:outline-none tab-button ${
                activeTab === "tab3" ? "active" : ""
              }`}
              onClick={() => setActiveTab("tab3")}
            >
              Inventario
            </button>
          </div>
        </div>

        <div
          id="tab1"
          className="p-4 tab-content bg-white shadow-md rounded-lg"
        >
          <p>
            <ServiciosSede servicios={servicios} />
          </p>
        </div>
        <div
          id="tab2"
          className="p-4 tab-content bg-white shadow-md rounded-lg hidden"
        >
          <p>
            <PersonalSede personas={personas} />
          </p>
        </div>
        <div
          id="tab3"
          className="p-4 tab-content bg-white shadow-md rounded-lg hidden"
        >
          <p>
            <InventarioSede inventarios={inventarios} />
          </p>
        </div>
      </div>
    </>
  );
};

export default Tabs;
