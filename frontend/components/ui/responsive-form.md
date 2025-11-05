# ResponsiveForm

Componente de formulario global y profesional que se adapta automáticamente entre modal (desktop) y drawer (móviles).

## Características

- **Adaptativo**: Modal en desktop, drawer en móviles
- **Header personalizable**: Título, descripción o contenido personalizado
- **Contenido scrolleable**: El área de contenido tiene scroll automático
- **Footer fijo**: Botones y acciones siempre visibles
- **Sin botón de cerrar manual**: Solo se cierra con `onOpenChange`

## Uso Básico

```tsx
import { ResponsiveForm } from '@/components/ui/responsive-form';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ResponsiveForm
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Crear Producto"
      description="Complete el formulario para crear un nuevo producto"
      size="5xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="my-form">
            Guardar
          </Button>
        </div>
      }
    >
      <form id="my-form" onSubmit={handleSubmit}>
        {/* Contenido del formulario */}
      </form>
    </ResponsiveForm>
  );
}
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `open` | `boolean` | ✅ | Estado de apertura del formulario |
| `onOpenChange` | `(open: boolean) => void` | ✅ | Callback para cambiar el estado |
| `title` | `string` | ✅ | Título principal del formulario |
| `description` | `string` | ❌ | Descripción debajo del título |
| `children` | `ReactNode` | ✅ | Contenido principal (scrolleable) |
| `header` | `ReactNode` | ❌ | Header personalizado (reemplaza title/description) |
| `footer` | `ReactNode` | ❌ | Footer personalizado con botones |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl' \| '6xl' \| '7xl' \| 'full'` | ❌ | Tamaño del modal (solo desktop) |
| `className` | `string` | ❌ | Clases adicionales para el contenido |

## Tamaños

Los tamaños se aplican solo en desktop (modal). En móvil (drawer) siempre ocupa el 95% de la altura.

- `sm`: 384px
- `md`: 448px
- `lg`: 512px
- `xl`: 576px
- `2xl`: 672px
- `3xl`: 768px
- `4xl`: 896px
- `5xl`: 1024px (por defecto)
- `6xl`: 1152px
- `7xl`: 1280px
- `full`: ancho completo

## Header Personalizado

Puedes personalizar completamente el header pasando un `ReactNode`:

```tsx
<ResponsiveForm
  open={isOpen}
  onOpenChange={setIsOpen}
  header={
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Título Personalizado</h2>
        <p className="text-sm text-muted-foreground">Con subtítulo</p>
      </div>
      <Badge>Nuevo</Badge>
    </div>
  }
>
  {/* Contenido */}
</ResponsiveForm>
```

## Footer Personalizado

El footer es ideal para botones de acción:

```tsx
<ResponsiveForm
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Mi Formulario"
  footer={
    <div className="flex justify-between w-full">
      <Button variant="ghost" onClick={handleReset}>
        Reiniciar
      </Button>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit" form="my-form">
          Guardar
        </Button>
      </div>
    </div>
  }
>
  {/* Contenido */}
</ResponsiveForm>
```

## Ejemplos

### Formulario Simple

```tsx
<ResponsiveForm
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Editar Usuario"
  description="Actualiza la información del usuario"
  size="3xl"
>
  <UserForm user={selectedUser} onCancel={() => setIsOpen(false)} />
</ResponsiveForm>
```

### Con Footer de Botones

```tsx
<ResponsiveForm
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Gestionar Permisos"
  size="5xl"
  footer={
    <div className="flex justify-end gap-3 w-full">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Guardar Permisos
      </Button>
    </div>
  }
>
  <PermissionsManager permissions={permissions} />
</ResponsiveForm>
```

## Notas

- En móviles el drawer no muestra botón de cerrar, usa `onOpenChange` para controlarlo
- El contenido es scrolleable automáticamente
- El header y footer son fijos (no hacen scroll)
- El tamaño solo afecta la vista desktop (modal)
