import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    )
  }

  // Mapear nombres de roles al español
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'super_admin': 'Super Administrador',
      'helpdesk': 'Mesa de Ayuda',
      'support': 'Soporte',
      'user': 'Usuario'
    }
    return roleNames[role] || role
  }

  // Mapear nombres de grupos conocidos
  const getGroupName = (guid) => {
    const groupNames = {
      'edc49d22-9ee8-4d90-a8b2-41cf64db1eed': 'Infraestructura',
      '2a16d910-c440-41a3-a896-eb6287185fef': 'Soporte',
      '71a6857d-3dec-4d6a-9ad7-cd2c03d06d12': 'Mesa de Ayuda'
    }
    return groupNames[guid] || guid.substring(0, 8) + '...'
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Información de tu cuenta y permisos</p>
        </div>

        {/* Tarjeta Principal de Perfil */}
        <div className="bg-white rounded-lg shadow-card border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32"></div>

          <div className="px-6 pb-6">
            {/* Foto de Perfil */}
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <div className="relative">
                {user.profilePhotoUrl && user.profilePhotoUrl !== `/api/auth/photo/${user.id}` ? (
                  <img
                    src={user.profilePhotoUrl}
                    alt={user.fullName}
                    className="w-32 h-32 rounded-lg border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=128`
                    }}
                  />
                ) : user.profilePhotoUrl === `/api/auth/photo/${user.id}` ? (
                  <img
                    src={user.profilePhotoUrl}
                    alt={user.fullName}
                    className="w-32 h-32 rounded-lg border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=128`
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg border-4 border-white shadow-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                  {user.firstName}
                </p>
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                  {user.lastName}
                </p>
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                  {user.email}
                </p>
              </div>

              {/* ID de Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Usuario
                </label>
                <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg text-sm font-mono">
                  {user.id.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Rol y Permisos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rol Asignado */}
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rol Asignado</h3>
                <p className="text-sm text-gray-600">Tu rol en el sistema</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="font-medium text-blue-900">{getRoleDisplayName(user.role)}</span>
              </div>
            </div>

            {user.groupAnalysis && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-600 uppercase mb-2">Análisis de Grupos</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>Total de grupos: <span className="font-semibold">{user.groupAnalysis.totalGroups}</span></p>
                  <p>Grupos relevantes: <span className="font-semibold">{Object.keys(user.groupAnalysis.relevantGroups || {}).length}</span></p>
                  <p>Rol asignado: <span className="font-semibold">{getRoleDisplayName(user.groupAnalysis.assignedRole)}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Permisos */}
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Permisos</h3>
                <p className="text-sm text-gray-600">Acciones permitidas</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {user.permissions && Object.entries(user.permissions).slice(0, 5).map(([resource, actions]) => (
                <div key={resource} className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="font-medium text-green-900 capitalize mb-2">{resource}</p>
                  <div className="flex flex-wrap gap-1">
                    {typeof actions === 'object' && Object.entries(actions).map(([action, allowed]) => (
                      allowed && (
                        <span key={action} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded capitalize">
                          {action}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              ))}
              {user.permissions && Object.keys(user.permissions).length > 5 && (
                <p className="text-sm text-gray-600 italic">
                  y {Object.keys(user.permissions).length - 5} recurso(s) más...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Grupos de Azure AD */}
        {user.groups && user.groups.length > 0 && (
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h5v-2a4.5 4.5 0 00-4.5-4.5h-8A4.5 4.5 0 001 20v2h5v-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Grupos Asignados</h3>
                <p className="text-sm text-gray-600">Grupos de Azure AD</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">Total: <span className="font-semibold text-gray-900">{user.groups.length} grupo(s)</span></p>

              {/* Grupos Relevantes Primero */}
              {user.groupAnalysis?.relevantGroups && Object.entries(user.groupAnalysis.relevantGroups).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Grupos Relevantes</p>
                  <div className="space-y-2">
                    {Object.entries(user.groupAnalysis.relevantGroups).map(([guid, name]) => (
                      <div key={guid} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                          <span className="font-medium text-purple-900">{name}</span>
                        </div>
                        <span className="text-xs text-purple-600 font-mono bg-purple-100 px-2 py-1 rounded">
                          {guid.substring(0, 8)}...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Otros Grupos */}
              {user.groups.length > (Object.keys(user.groupAnalysis?.relevantGroups || {}).length) && (
                <details className="cursor-pointer">
                  <summary className="text-sm font-medium text-gray-700 hover:text-gray-900 select-none">
                    Ver otros {user.groups.length - (Object.keys(user.groupAnalysis?.relevantGroups || {}).length).length} grupo(s)
                  </summary>
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {user.groups
                      .filter(guid => !Object.keys(user.groupAnalysis?.relevantGroups || {}).includes(guid))
                      .map((guid) => (
                        <div key={guid} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="text-xs text-gray-600 font-mono">{guid}</span>
                        </div>
                      ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Los datos de tu perfil se sincronizan con Azure Active Directory. Para cambios permanentes, contacta a tu administrador.
          </p>
        </div>
      </div>
    </div>
  )
}
