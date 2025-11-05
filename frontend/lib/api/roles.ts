import { api } from './index';
import type {
  Role,
  RolesListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
} from '@/types';

export const rolesApi = {
  // Get all roles
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<RolesListResponse> => {
    const response = await api.get('/roles', { params });
    return response.data;
  },

  // Get role by ID
  getById: async (id: string): Promise<Role> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Create role
  create: async (data: CreateRoleRequest): Promise<Role> => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  // Update role
  update: async (id: string, data: UpdateRoleRequest): Promise<Role> => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  // Delete role
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  // Assign permissions to role
  assignPermissions: async (id: string, data: AssignPermissionsRequest): Promise<{ message: string }> => {
    const response = await api.post(`/roles/${id}/permissions`, data);
    return response.data;
  },
};
