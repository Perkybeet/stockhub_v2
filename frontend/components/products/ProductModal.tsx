'use client';

import { Button } from '@/components/ui/button';
import { ModalBase } from '@/components/ui/modal-base';
import { ProductForm } from './ProductForm';
import type { Product, Category, Unit } from '@/types';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories: Category[];
  units: Unit[];
  onSuccess?: () => void;
}

export function ProductModal({
  open,
  onOpenChange,
  product,
  categories,
  units,
  onSuccess,
}: ProductModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <ModalBase
      open={open}
      onOpenChange={onOpenChange}
      title={product ? 'Edit Product' : 'Create Product'}
      description={
        product
          ? 'Update the product information below'
          : 'Add a new product to your catalog'
      }
      size="5xl"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            className="min-w-[100px]"
          >
            {product ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <ProductForm
        product={product}
        categories={categories}
        units={units}
        onSuccess={handleSuccess}
        formId="product-form"
        showButtons={false}
      />
    </ModalBase>
  );
}
