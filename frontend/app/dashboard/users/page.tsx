'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserForm, RoleForm, UsersTable, RolesTable, PermissionsManager } from '@/components/users';
import { usersApi } from '@/lib/api/users';
import { rolesApi } from '@/lib/api/roles';
import { permissionsApi } from '@/lib/api/permissions';
import { UserPlus, Users, Shield, Search, Key } from 'lucide-react';
import type {
  User,
  Role,
  PermissionsByResource,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/types';

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState('users');
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesTotal, setRolesTotal] = useState(0);
  const [rolesSearch, setRolesSearch] = useState('');

  // Permissions state
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionsByResource[]>([]);

  // Modals state
  const [userModal, setUserModal] = useState<{ open: boolean; user?: User }>({ open: false });
  const [roleModal, setRoleModal] = useState<{ open: boolean; role?: Role }>({ open: false });
  const [permissionsModal, setPermissionsModal] = useState<{ open: boolean; role?: Role }>({ open: false });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'user' | 'role';
    id?: string;
    name?: string;
  }>({ open: false, type: 'user' });

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await usersApi.getAll({
        page: usersPage,
        limit: 20,
        search: usersSearch || undefined,
      });
      setUsers(response.data);
      setUsersTotal(response.meta.total);
    } catch (error) {
      toast.error('Error al cargar usuarios');
      console.error(error);
    } finally {
      setUsersLoading(false);
    }
  }, [usersPage, usersSearch]);

  // Load roles
  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const response = await rolesApi.getAll({
        page: rolesPage,
        limit: 20,
        search: rolesSearch || undefined,
      });
      setRoles(response.data);
      setRolesTotal(response.meta.total);
    } catch (error) {
      toast.error('Error al cargar roles');
      console.error(error);
    } finally {
      setRolesLoading(false);
    }
  }, [rolesPage, rolesSearch]);

  // Load permissions
  const loadPermissions = useCallback(async () => {
    try {
      const data = await permissionsApi.getGrouped();
      setPermissionsGrouped(data);
    } catch (error) {
      toast.error('Error al cargar permisos');
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // User handlers
  const handleCreateUser = async (data: CreateUserRequest) => {
    try {
      await usersApi.create(data);
      toast.success('Usuario creado exitosamente');
      setUserModal({ open: false });
      loadUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleUpdateUser = async (data: UpdateUserRequest) => {
    if (!userModal.user) return;
    try {
      await usersApi.update(userModal.user.id, data);
      toast.success('Usuario actualizado exitosamente');
      setUserModal({ open: false });
      loadUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al actualizar usuario');
    }
  };

  const handleQuickUpdateUser = async (userId: string, field: string, value: string | boolean) => {
    try {
      await usersApi.update(userId, { [field]: value } as UpdateUserRequest);
      toast.success('Actualizado correctamente');
      
      // Actualizar solo el usuario modificado en el estado local
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, [field]: value } : u))
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleRoleChange = async (userId: string, roleIds: string[]) => {
    try {
      await usersApi.assignRoles(userId, { roleIds });
      toast.success('Roles actualizados');
      
      // Obtener solo el usuario actualizado
      const updatedUser = await usersApi.getById(userId);
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? updatedUser : u))
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al actualizar roles');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.id) return;
    try {
      await usersApi.delete(deleteDialog.id);
      toast.success('Usuario desactivado exitosamente');
      setDeleteDialog({ open: false, type: 'user' });
      loadUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al desactivar usuario');
    }
  };

  // Role handlers
  const handleCreateRole = async (data: CreateRoleRequest) => {
    try {
      await rolesApi.create(data);
      toast.success('Rol creado exitosamente');
      setRoleModal({ open: false });
      loadRoles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al crear rol');
    }
  };

  const handleUpdateRole = async (data: UpdateRoleRequest) => {
    if (!roleModal.role) return;
    try {
      await rolesApi.update(roleModal.role.id, data);
      toast.success('Rol actualizado exitosamente');
      setRoleModal({ open: false });
      loadRoles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al actualizar rol');
    }
  };

  const handleQuickUpdateRole = async (roleId: string, field: string, value: string | boolean) => {
    try {
      await rolesApi.update(roleId, { [field]: value } as UpdateRoleRequest);
      toast.success('Actualizado correctamente');
      loadRoles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al actualizar');
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteDialog.id) return;
    try {
      await rolesApi.delete(deleteDialog.id);
      toast.success('Rol eliminado exitosamente');
      setDeleteDialog({ open: false, type: 'role' });
      loadRoles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al eliminar rol');
    }
  };

  const handleOpenPermissionsModal = (role: Role) => {
    setPermissionsModal({ open: true, role });
    setSelectedPermissions(role.permissions?.map((p) => p.id) || []);
  };

  const handleSavePermissions = async () => {
    if (!permissionsModal.role) return;
    try {
      await rolesApi.assignPermissions(permissionsModal.role.id, {
        permissionIds: selectedPermissions,
      });
      toast.success('Permisos actualizados exitosamente');
      setPermissionsModal({ open: false });
      loadRoles();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Error al actualizar permisos');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios y Roles</h1>
          <p className="text-muted-foreground mt-1">
            Control completo de usuarios, roles y permisos de tu organización
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    {usersTotal} usuario{usersTotal !== 1 ? 's' : ''} registrado{usersTotal !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuarios..."
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={() => setUserModal({ open: true })}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={users}
                roles={roles}
                onEdit={(user) => setUserModal({ open: true, user })}
                onDelete={(user) =>
                  setDeleteDialog({
                    open: true,
                    type: 'user',
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                  })
                }
                onQuickUpdate={handleQuickUpdateUser}
                onRoleChange={handleRoleChange}
                isLoading={usersLoading}
              />

              {/* Pagination */}
              {usersTotal > 20 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(usersPage - 1) * 20 + 1} a{' '}
                    {Math.min(usersPage * 20, usersTotal)} de {usersTotal}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPage === 1}
                      onClick={() => setUsersPage(usersPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPage * 20 >= usersTotal}
                      onClick={() => setUsersPage(usersPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROLES TAB */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Gestión de Roles</CardTitle>
                  <CardDescription>
                    {rolesTotal} rol{rolesTotal !== 1 ? 'es' : ''} definido{rolesTotal !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar roles..."
                      value={rolesSearch}
                      onChange={(e) => setRolesSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={() => setRoleModal({ open: true })}>
                    <Shield className="h-4 w-4 mr-2" />
                    Nuevo Rol
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RolesTable
                roles={roles}
                onEdit={(role) => setRoleModal({ open: true, role })}
                onDelete={(role) =>
                  setDeleteDialog({
                    open: true,
                    type: 'role',
                    id: role.id,
                    name: role.name,
                  })
                }
                onQuickUpdate={handleQuickUpdateRole}
                onPermissionsEdit={handleOpenPermissionsModal}
                isLoading={rolesLoading}
              />

              {/* Pagination */}
              {rolesTotal > 20 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(rolesPage - 1) * 20 + 1} a{' '}
                    {Math.min(rolesPage * 20, rolesTotal)} de {rolesTotal}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={rolesPage === 1}
                      onClick={() => setRolesPage(rolesPage - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={rolesPage * 20 >= rolesTotal}
                      onClick={() => setRolesPage(rolesPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Modal */}
      <Dialog open={userModal.open} onOpenChange={(open) => setUserModal({ open })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {userModal.user ? 'Editar Usuario' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {userModal.user
                ? 'Actualiza la información completa del usuario'
                : 'Crea un nuevo usuario y asigna sus roles'}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={userModal.user}
            roles={roles}
            onSubmit={
              userModal.user
                ? (data) => handleUpdateUser(data as UpdateUserRequest)
                : (data) => handleCreateUser(data as CreateUserRequest)
            }
            onCancel={() => setUserModal({ open: false })}
          />
        </DialogContent>
      </Dialog>

      {/* Role Modal */}
      <Dialog open={roleModal.open} onOpenChange={(open) => setRoleModal({ open })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {roleModal.role ? 'Editar Rol' : 'Nuevo Rol'}
            </DialogTitle>
            <DialogDescription>
              {roleModal.role
                ? 'Actualiza la configuración del rol'
                : 'Crea un nuevo rol y asigna sus permisos'}
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            role={roleModal.role}
            permissionsGrouped={permissionsGrouped}
            onSubmit={
              roleModal.role
                ? (data) => handleUpdateRole(data as UpdateRoleRequest)
                : (data) => handleCreateRole(data as CreateRoleRequest)
            }
            onCancel={() => setRoleModal({ open: false })}
          />
        </DialogContent>
      </Dialog>

      {/* Permissions Manager Modal */}
      <Dialog open={permissionsModal.open} onOpenChange={(open) => setPermissionsModal({ open })}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Gestionar Permisos: {permissionsModal.role?.name}
            </DialogTitle>
            <DialogDescription>
              Selecciona los permisos que tendrá este rol
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <PermissionsManager
              permissionsGrouped={permissionsGrouped}
              selectedPermissions={selectedPermissions}
              onPermissionsChange={setSelectedPermissions}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setPermissionsModal({ open: false })}>
              Cancelar
            </Button>
            <Button onClick={handleSavePermissions}>
              <Key className="h-4 w-4 mr-2" />
              Guardar Permisos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción {deleteDialog.type === 'user' ? 'desactivará al usuario' : 'eliminará el rol'}{' '}
              <strong className="text-foreground">{deleteDialog.name}</strong>.
              <br />
              {deleteDialog.type === 'user'
                ? 'El usuario no podrá acceder al sistema hasta que sea reactivado.'
                : 'Esta acción no se puede deshacer y el rol será eliminado permanentemente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDialog.type === 'user' ? handleDeleteUser : handleDeleteRole}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteDialog.type === 'user' ? 'Desactivar' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
