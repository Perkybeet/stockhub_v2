'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { toast } from 'sonner';
import { productsApi } from '@/lib/api';
import type { Product, Category, Unit } from '@/types';

const productFormSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(100),
  barcode: z.string().max(100).optional(),
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().max(1000).optional(),
  categoryId: z.string().optional(),
  unitId: z.string().min(1, 'Unit is required'),
  unitPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  minStockLevel: z.number().min(0).optional(),
  maxStockLevel: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
  productType: z.enum(['simple', 'composite', 'service']),
  isPerishable: z.boolean(),
  shelfLifeDays: z.number().int().min(1).optional(),
  storageConditions: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  units: Unit[];
  onSuccess?: () => void;
  onCancel?: () => void;
  formId?: string;
  showButtons?: boolean;
}

export function ProductForm({
  product,
  categories,
  units,
  onSuccess,
  onCancel,
  formId = 'product-form',
  showButtons = true,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      name: product?.name || '',
      description: product?.description || '',
      categoryId: product?.categoryId || '',
      unitId: product?.unitId || '',
      unitPrice: product?.unitPrice || undefined,
      costPrice: product?.costPrice || undefined,
      taxRate: product?.taxRate || undefined,
      minStockLevel: product?.minStockLevel || undefined,
      maxStockLevel: product?.maxStockLevel || undefined,
      reorderPoint: product?.reorderPoint || undefined,
      reorderQuantity: product?.reorderQuantity || undefined,
      productType: product?.productType || 'simple',
      isPerishable: product?.isPerishable || false,
      shelfLifeDays: product?.shelfLifeDays || undefined,
      storageConditions: product?.storageConditions || '',
      imageUrl: product?.imageUrl || '',
      isActive: product?.isActive ?? true,
    },
  });

  // Use useWatch to avoid unnecessary re-renders
  const isPerishable = useWatch({
    control: form.control,
    name: 'isPerishable',
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      // Clean up empty strings
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>);

      if (product) {
        await productsApi.update(product.id, cleanData);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(cleanData);
        toast.success('Product created successfully');
      }

      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(product ? 'Failed to update product' : 'Failed to create product', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">Basic Information</h3>
            <p className="text-sm text-muted-foreground mt-1">Product identification and description</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU *</FormLabel>
                <FormControl>
                  <Input placeholder="PROD-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Product Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="composite">Composite</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">Pricing</h3>
            <p className="text-sm text-muted-foreground mt-1">Cost and selling price information</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>

        {/* Inventory Settings Section */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">Inventory Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">Stock levels and reorder parameters</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock Level</FormLabel>
                <FormControl>
                  <Input type="number" step="0.001" placeholder="0.000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Stock Level</FormLabel>
                <FormControl>
                  <Input type="number" step="0.001" placeholder="0.000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Point</FormLabel>
                <FormControl>
                  <Input type="number" step="0.001" placeholder="0.000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorderQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Quantity</FormLabel>
                <FormControl>
                  <Input type="number" step="0.001" placeholder="0.000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>

        {/* Storage Settings Section */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">Storage Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">Storage conditions and perishability</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="isPerishable"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormControl>
                  <CheckboxField
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    label="Perishable Product"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {isPerishable && (
            <FormField
              control={form.control}
              name="shelfLifeDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shelf Life (days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="storageConditions"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Storage Conditions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Store in a cool, dry place"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>

        {/* Additional Settings Section */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className="text-xl font-bold text-foreground">Additional Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">Image and status configuration</p>
          </div>
          
          <div className="space-y-6">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <CheckboxField
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Active Product"
                  description="Inactive products won't appear in selections"
                />
              </FormControl>
            </FormItem>
          )}
        />
          </div>
        </div>

        {showButtons && (
          <div className="flex justify-end gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
