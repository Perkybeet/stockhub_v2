'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Shield, 
  Users,
  Key,
  Check,
  X,
  Lock,
  AlertCircle
} from 'lucide-react';
import type { Role, Permission } from '@/types';

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onQuickUpdate: (roleId: string, field: string, value: string | boolean) => Promise<void>;
  onPermissionsEdit: (role: Role) => void;
  isLoading?: boolean;
}

export function RolesTable({ 
  roles, 
  onEdit, 
  onDelete, 
  onQuickUpdate,
  onPermissionsEdit,
  isLoading 
}: RolesTableProps) {
  const [editingCell, setEditingCell] = useState<{ roleId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [savingCell, setSavingCell] = useState<string | null>(null);

  const handleStartEdit = (roleId: string, field: string, currentValue: string) => {
    setEditingCell({ roleId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async (roleId: string, field: string) => {
    setSavingCell(`${roleId}-${field}`);
    try {
      await onQuickUpdate(roleId, field, editValue);
      setEditingCell(null);
    } finally {
      setSavingCell(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleToggleActive = async (roleId: string, currentValue: boolean) => {
    setSavingCell(`${roleId}-isActive`);
    try {
      await onQuickUpdate(roleId, 'isActive', !currentValue);
    } finally {
      setSavingCell(null);
    }
  };

  const getPermissionsByResource = (rolePermissions: Permission[]) => {
    if (!rolePermissions || rolePermissions.length === 0) return {};
    
    return rolePermissions.reduce((acc, perm) => {
      const resource = perm.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando roles...</p>
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/5">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay roles</h3>
        <p className="text-sm text-muted-foreground">
          Crea tu primer rol personalizado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => {
        const isEditingName = editingCell?.roleId === role.id && editingCell?.field === 'name';
        const isEditingDescription = editingCell?.roleId === role.id && editingCell?.field === 'description';
        const isSaving = savingCell?.startsWith(role.id);
        const permsByResource = getPermissionsByResource(role.permissions || []);
        const resourceCount = Object.keys(permsByResource).length;

        return (
          <div
            key={role.id}
            className="group border rounded-lg p-4 bg-card hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Role Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 max-w-xs"
                          autoFocus
                          disabled={role.isSystemRole}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(role.id, 'name');
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSaveEdit(role.id, 'name')}
                          disabled={isSaving || role.isSystemRole}
                        >
                          {isSaving ? (
                            <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-lg font-semibold ${!role.isSystemRole && 'cursor-pointer hover:text-primary transition-colors'}`}
                          onClick={() => !role.isSystemRole && handleStartEdit(role.id, 'name', role.name)}
                        >
                          {role.name}
                        </h3>
                        {!role.isSystemRole && (
                          <Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                        )}
                        {role.isSystemRole && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Sistema
                          </Badge>
                        )}
                      </div>
                    )}

                    {isEditingDescription ? (
                      <div className="flex items-start gap-2">
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm min-h-[60px]"
                          autoFocus
                          disabled={role.isSystemRole}
                        />
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSaveEdit(role.id, 'description')}
                            disabled={isSaving || role.isSystemRole}
                          >
                            {isSaving ? (
                              <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`text-sm text-muted-foreground ${!role.isSystemRole && 'cursor-pointer hover:text-primary/70 transition-colors'}`}
                        onClick={() => !role.isSystemRole && handleStartEdit(role.id, 'description', role.description || '')}
                      >
                        {role.description || <span className="italic">Sin descripción</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="flex flex-wrap gap-2 pl-12">
                  {resourceCount > 0 ? (
                    <>
                      {Object.entries(permsByResource).slice(0, 3).map(([resource, perms]) => (
                        <Badge key={resource} variant="secondary" className="text-xs">
                          <Key className="h-3 w-3 mr-1" />
                          {resource.replace(/_/g, ' ')}: {perms.length}
                        </Badge>
                      ))}
                      {resourceCount > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resourceCount - 3} más
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline" className="text-xs text-amber-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Sin permisos asignados
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right: Stats & Actions */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {role.userCount || 0} usuarios
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => handleToggleActive(role.id, role.isActive)}
                    disabled={savingCell === `${role.id}-isActive` || role.isSystemRole}
                  >
                    {savingCell === `${role.id}-isActive` ? (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Badge
                        variant={role.isActive ? 'default' : 'destructive'}
                        className={`cursor-pointer hover:opacity-80 transition-opacity ${
                          role.isSystemRole 
                            ? 'cursor-not-allowed' 
                            : role.isActive 
                              ? 'bg-green-600 hover:bg-green-600/80' 
                              : 'bg-red-600 hover:bg-red-600/80'
                        }`}
                      >
                        {role.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-accent data-[state=open]:bg-accent transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onPermissionsEdit(role)}>
                        <Key className="h-4 w-4 mr-2" />
                        Gestionar permisos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(role)} disabled={role.isSystemRole}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar completo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(role)}
                        disabled={role.isSystemRole || (role.userCount || 0) > 0}
                        className="text-red-600 focus:text-red-600"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {role.permissions?.length || 0} permisos
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {resourceCount} recursos
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
