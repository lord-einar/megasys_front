import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para verificar permisos del usuario
 * Basado en la configuración de roles del backend
 */

// Definición de permisos (debe coincidir con backend)
const PERMISSIONS = {
  sedes: {
    read: ['super_admin', 'helpdesk', 'support'],
    create: ['super_admin'],
    update: ['super_admin', 'helpdesk', 'support'],
    delete: ['super_admin']
  },
  personal: {
    read: ['super_admin', 'helpdesk', 'support'],
    create: ['super_admin', 'helpdesk', 'support'],
    update: ['super_admin', 'helpdesk', 'support'],
    delete: ['super_admin', 'helpdesk']
  },
  inventario: {
    read: ['super_admin', 'helpdesk', 'support'],
    create: ['super_admin', 'support'],
    update: ['super_admin', 'support'],
    delete: ['super_admin', 'support']
  },
  remitos: {
    read: ['super_admin', 'helpdesk', 'support'],
    create: ['super_admin', 'support'],
    update: ['super_admin', 'support'],
    delete: ['super_admin', 'support']
  },
  proveedores: {
    read: ['super_admin', 'helpdesk', 'support'],
    create: ['super_admin'],
    update: ['super_admin'],
    delete: ['super_admin']
  },
  visitas: {
    read: ['super_admin', 'helpdesk', 'support'],
    create: ['super_admin', 'support'],
    update: ['super_admin', 'support'],
    delete: ['super_admin'],
    enviar_aviso: ['super_admin', 'support'],
    completar_informe: ['super_admin', 'support'],
    config_checklist: ['super_admin'],
    config_categorias: ['super_admin']
  },
  admin: {
    system_settings: ['super_admin'],
    user_management: ['super_admin'],
    audit_logs: ['super_admin', 'helpdesk'],
    reports: ['super_admin']
  }
};

export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Verifica si el usuario tiene permiso para una acción específica
   * @param {string} resource - Recurso (ej: 'sedes', 'personal', 'visitas')
   * @param {string} action - Acción (ej: 'create', 'update', 'delete')
   * @returns {boolean}
   */
  const hasPermission = (resource, action) => {
    if (!user || !user.role) return false;

    // Super admin tiene todos los permisos
    if (user.role === 'super_admin') return true;

    // Verificar si existe el recurso y la acción
    if (!PERMISSIONS[resource] || !PERMISSIONS[resource][action]) {
      console.warn(`Permiso no definido: ${resource}.${action}`);
      return false;
    }

    // Verificar si el rol del usuario está en la lista de roles permitidos
    return PERMISSIONS[resource][action].includes(user.role);
  };

  /**
   * Verifica si el usuario puede crear un recurso
   */
  const canCreate = (resource) => hasPermission(resource, 'create');

  /**
   * Verifica si el usuario puede editar un recurso
   */
  const canUpdate = (resource) => hasPermission(resource, 'update');

  /**
   * Verifica si el usuario puede eliminar un recurso
   */
  const canDelete = (resource) => hasPermission(resource, 'delete');

  /**
   * Verifica si el usuario puede leer un recurso
   */
  const canRead = (resource) => hasPermission(resource, 'read');

  /**
   * Obtiene el rol actual del usuario
   */
  const getUserRole = () => user?.role || 'user';

  /**
   * Verifica si el usuario tiene un rol específico o superior
   */
  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return {
    hasPermission,
    canCreate,
    canUpdate,
    canDelete,
    canRead,
    getUserRole,
    hasRole,
    isSuperAdmin: user?.role === 'super_admin',
    isSupport: user?.role === 'support',
    isHelpdesk: user?.role === 'helpdesk'
  };
};
