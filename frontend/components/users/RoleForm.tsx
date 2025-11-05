'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { CreateRoleRequest, UpdateRoleRequest, Role, PermissionsByResource } from '@/types';

interface RoleFormProps {
  role?: Role;
  permissionsGrouped: PermissionsByResource[];
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
  onCancel: () => void;
}

export function RoleForm({ role, permissionsGrouped, onSubmit, onCancel }: RoleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions?.map((p) => p.id) || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRoleRequest>({
    defaultValues: role
      ? {
          name: role.name,
          slug: role.slug,
          description: role.description || '',
          isActive: role.isActive,
        }
      : {
          name: '',
          slug: '',
          description: '',
          isActive: true,
        },
  });

  const handleFormSubmit = async (data: CreateRoleRequest) => {
    setIsLoading(true);
    try {
      await onSubmit({
        ...data,
        permissionIds: selectedPermissions,
      });
      reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleResourceToggle = (resourcePerms: string[]) => {
    const allSelected = resourcePerms.every((id) => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedPermissions((prev) => prev.filter((id) => !resourcePerms.includes(id)));
    } else {
      // Select all
      setSelectedPermissions((prev) => [...new Set([...prev, ...resourcePerms])]);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nombre del Rol <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', {
              required: 'El nombre es requerido',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres',
              },
            })}
            placeholder="Gerente de Almacén"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">
            Identificador (Slug) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            {...register('slug', {
              required: 'El slug es requerido',
              pattern: {
                value: /^[a-z0-9_]+$/,
                message: 'Solo letras minúsculas, números y guiones bajos',
              },
            })}
            placeholder="warehouse_manager"
            disabled={role?.isSystemRole}
          />
          {errors.slug && (
            <p className="text-sm text-red-500">{errors.slug.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Descripción del rol y sus responsabilidades"
            rows={3}
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center space-x-2 md:col-span-2">
          <Checkbox
            id="isActive"
            {...register('isActive')}
            defaultChecked={role?.isActive ?? true}
          />
          <Label htmlFor="isActive" className="font-normal">
            Rol activo
          </Label>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-4">
        <Label className="text-base">Permisos del Rol</Label>
        <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
          {permissionsGrouped.map((group) => {
            const resourcePermIds = group.permissions.map((p) => p.id);
            const allSelected = resourcePermIds.every((id) =>
              selectedPermissions.includes(id)
            );
            const someSelected = resourcePermIds.some((id) =>
              selectedPermissions.includes(id)
            );

            return (
              <div key={group.resource} className="space-y-2">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Checkbox
                    id={`resource-${group.resource}`}
                    checked={allSelected}
                    onCheckedChange={() => handleResourceToggle(resourcePermIds)}
                  />
                  <Label
                    htmlFor={`resource-${group.resource}`}
                    className="font-semibold capitalize cursor-pointer text-base"
                  >
                    {group.resource.replace(/_/g, ' ')}
                  </Label>
                  {someSelected && !allSelected && (
                    <span className="text-xs text-muted-foreground">(Parcial)</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
                  {group.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <div className="space-y-0.5">
                        <Label
                          htmlFor={`perm-${permission.id}`}
                          className="font-normal cursor-pointer text-sm"
                        >
                          {permission.action}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {selectedPermissions.length === 0 && (
          <p className="text-sm text-amber-600">
            ⚠️ Advertencia: Este rol no tendrá ningún permiso asignado.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || role?.isSystemRole}>
          {isLoading ? 'Guardando...' : role ? 'Actualizar Rol' : 'Crear Rol'}
        </Button>
      </div>
    </form>
  );
}
