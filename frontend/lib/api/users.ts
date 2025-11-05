import { api } from './index';
import type {
  User,
  UsersListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRolesRequest,
} from '@/types';

export const usersApi = {
  // Get all users
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UsersListResponse> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Assign roles to user
  assignRoles: async (id: string, data: AssignRolesRequest): Promise<{ message: string }> => {
    const response = await api.post(`/users/${id}/roles`, data);
    return response.data;
  },
};
