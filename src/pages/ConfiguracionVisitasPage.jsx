import { useState } from 'react'
import TablaChecklistItems from '../components/visitas/TablaChecklistItems'
import TablaCategoriaProblemas from '../components/visitas/TablaCategoriaProblemas'

export default function ConfiguracionVisitasPage() {
  const [activeTab, setActiveTab] = useState('checklist')

  const tabs = [
    { id: 'checklist', label: 'Items de Checklist', icon: 'clipboard-list' },
    { id: 'categorias', label: 'Categorias de Problemas', icon: 'tag' }
  ]

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuracion de Visitas</h1>
        <p className="text-gray-600 mt-2">
          Administra los items del checklist y las categorias de problemas para las visitas tecnicas
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.icon === 'clipboard-list' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )}
                {tab.icon === 'tag' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                )}
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'checklist' && <TablaChecklistItems />}
        {activeTab === 'categorias' && <TablaCategoriaProblemas />}
      </div>
    </div>
  )
}
