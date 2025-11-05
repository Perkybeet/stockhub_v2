import { api } from './index';
import type {
  Permission,
  PermissionsListResponse,
  PermissionsByResource,
} from '@/types';

export const permissionsApi = {
  // Get all permissions
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    resource?: string;
  }): Promise<PermissionsListResponse> => {
    const response = await api.get('/permissions', { params });
    return response.data;
  },

  // Get permissions grouped by resource
  getGrouped: async (): Promise<PermissionsByResource[]> => {
    const response = await api.get('/permissions/grouped');
    return response.data;
  },

  // Get permission by ID
  getById: async (id: string): Promise<Permission> => {
    const response = await api.get(`/permissions/${id}`);
    return response.data;
  },
};
