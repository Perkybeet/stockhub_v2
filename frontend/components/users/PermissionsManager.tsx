'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Key, 
  Search, 
  CheckCircle2, 
  Circle,
  ChevronDown,
  ChevronRight,
  Shield
} from 'lucide-react';
import type { PermissionsByResource, Permission } from '@/types';

interface PermissionsManagerProps {
  permissionsGrouped: PermissionsByResource[];
  selectedPermissions: string[];
  onPermissionsChange: (permissionIds: string[]) => void;
  isLoading?: boolean;
}

export function PermissionsManager({
  permissionsGrouped,
  selectedPermissions,
  onPermissionsChange,
  isLoading,
}: PermissionsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set(permissionsGrouped.map((g) => g.resource))
  );

  const toggleResource = (resource: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource);
    } else {
      newExpanded.add(resource);
    }
    setExpandedResources(newExpanded);
  };

  const togglePermission = (permissionId: string) => {
    const newSelected = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];
    onPermissionsChange(newSelected);
  };

  const toggleResourceAllPerms = (resourcePermissions: Permission[]) => {
    const resourcePermIds = resourcePermissions.map((p) => p.id);
    const allSelected = resourcePermIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all
      onPermissionsChange(selectedPermissions.filter((id) => !resourcePermIds.includes(id)));
    } else {
      // Select all
      const newSelected = [...new Set([...selectedPermissions, ...resourcePermIds])];
      onPermissionsChange(newSelected);
    }
  };

  const selectAll = () => {
    const allPermIds = permissionsGrouped.flatMap((g) => g.permissions.map((p) => p.id));
    onPermissionsChange(allPermIds);
  };

  const deselectAll = () => {
    onPermissionsChange([]);
  };

  const filteredGroups = permissionsGrouped
    .map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.resource.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.permissions.length > 0);

  const totalPermissions = permissionsGrouped.reduce(
    (sum, g) => sum + g.permissions.length,
    0
  );
  const selectedCount = selectedPermissions.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gestión de Permisos
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedCount} de {totalPermissions} permisos seleccionados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={isLoading || selectedCount === totalPermissions}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Seleccionar todo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deselectAll}
            disabled={isLoading || selectedCount === 0}
          >
            <Circle className="h-4 w-4 mr-2" />
            Deseleccionar todo
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(selectedCount / totalPermissions) * 100}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar permisos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Permissions List */}
      <ScrollArea className="h-[500px] border rounded-lg p-4">
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No se encontraron permisos</p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isExpanded = expandedResources.has(group.resource);
              const resourcePermIds = group.permissions.map((p) => p.id);
              const selectedInResource = resourcePermIds.filter((id) =>
                selectedPermissions.includes(id)
              ).length;
              const allSelected = selectedInResource === resourcePermIds.length;
              const someSelected = selectedInResource > 0 && !allSelected;

              return (
                <div
                  key={group.resource}
                  className="border rounded-lg overflow-hidden bg-card"
                >
                  {/* Resource Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleResource(group.resource)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleResource(group.resource);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => toggleResourceAllPerms(group.permissions)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-1">
                        <h4 className="font-semibold capitalize flex items-center gap-2">
                          <Key className="h-4 w-4 text-primary" />
                          {group.resource.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {selectedInResource} de {resourcePermIds.length} seleccionados
                        </p>
                      </div>

                      <Badge
                        variant={allSelected ? 'default' : someSelected ? 'secondary' : 'outline'}
                        className="ml-auto"
                      >
                        {resourcePermIds.length} permisos
                      </Badge>
                    </div>
                  </div>

                  {/* Permissions Grid */}
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.permissions.map((permission) => {
                        const isSelected = selectedPermissions.includes(permission.id);
                        return (
                          <div
                            key={permission.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm ${
                              isSelected
                                ? 'bg-primary/5 border-primary/30'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => togglePermission(permission.id)}
                          >
                            <div className="flex items-start gap-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => togglePermission(permission.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="font-medium text-sm">{permission.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {permission.action}
                                </div>
                                {permission.description && (
                                  <div className="text-xs text-muted-foreground italic">
                                    {permission.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {selectedCount === 0 && '⚠️ Ningún permiso seleccionado'}
          {selectedCount > 0 && selectedCount < totalPermissions && `📊 ${selectedCount} permisos seleccionados`}
          {selectedCount === totalPermissions && '✅ Todos los permisos seleccionados'}
        </div>
        <div className="text-sm font-semibold">
          {((selectedCount / totalPermissions) * 100).toFixed(0)}% completado
        </div>
      </div>
    </div>
  );
}
