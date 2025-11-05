'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Shield, 
  Mail, 
  Phone,
  Clock,
  Check,
  X,
  UserCog
} from 'lucide-react';
import type { User, Role } from '@/types';

interface UsersTableProps {
  users: User[];
  roles: Role[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onQuickUpdate: (userId: string, field: string, value: string | boolean) => Promise<void>;
  onRoleChange: (userId: string, roleIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function UsersTable({ 
  users, 
  roles, 
  onEdit, 
  onDelete, 
  onQuickUpdate,
  onRoleChange,
  isLoading 
}: UsersTableProps) {
  const handleToggleActive = async (userId: string, currentValue: boolean) => {
    await onQuickUpdate(userId, 'isActive', !currentValue);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/5">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <UserCog className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
        <p className="text-sm text-muted-foreground">
          Crea tu primer usuario para empezar
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[250px]">Usuario</TableHead>
            <TableHead className="w-[250px]">Email</TableHead>
            <TableHead className="w-[150px]">Teléfono</TableHead>
            <TableHead className="w-[200px]">Roles</TableHead>
            <TableHead className="w-[100px]">Estado</TableHead>
            <TableHead className="w-20 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            return (
              <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary font-semibold">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Último acceso: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </div>
                  {user.isEmailVerified && (
                    <Badge variant="outline" className="mt-1 text-xs border-green-200 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </TableCell>

                {/* Phone */}
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {user.phone || <span className="text-muted-foreground italic">Sin teléfono</span>}
                  </div>
                </TableCell>

                {/* Roles */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex flex-wrap gap-1 cursor-pointer">
                        {user.roles && user.roles.length > 0 ? (
                          <>
                            <Badge
                              variant="secondary"
                              className="text-xs hover:bg-secondary/80 transition-colors"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              {user.roles[0].name}
                            </Badge>
                            {user.roles.length > 1 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.roles.length - 1}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Sin roles
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Asignar Roles</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-2 space-y-2">
                        {roles.map((role) => {
                          const isAssigned = user.roles?.some((r) => r.id === role.id);
                          return (
                            <div key={role.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`role-${user.id}-${role.id}`}
                                checked={isAssigned}
                                onCheckedChange={async (checked) => {
                                  const currentRoleIds = user.roles?.map((r) => r.id) || [];
                                  const newRoleIds = checked
                                    ? [...currentRoleIds, role.id]
                                    : currentRoleIds.filter((id) => id !== role.id);
                                  await onRoleChange(user.id, newRoleIds);
                                }}
                              />
                              <label
                                htmlFor={`role-${user.id}-${role.id}`}
                                className="text-sm cursor-pointer flex-1"
                              >
                                {role.name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={user.isActive ? 'default' : 'destructive'}
                    className={user.isActive 
                      ? 'bg-green-600' 
                      : 'bg-red-600'
                    }
                  >
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
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
                      <DropdownMenuItem 
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className="dropdown-hover"
                      >
                        {user.isActive ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onEdit(user)}
                        className="dropdown-hover-blue"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-300 my-1" />
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="dropdown-hover-red text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
