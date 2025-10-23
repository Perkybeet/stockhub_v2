import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createProductDto: CreateProductDto) {
    // Check if SKU already exists for this company
    const existingSku = await this.prisma.product.findUnique({
      where: {
        companyId_sku: {
          companyId,
          sku: createProductDto.sku,
        },
      },
    });

    if (existingSku) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Check if barcode already exists (if provided)
    if (createProductDto.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: {
          companyId_barcode: {
            companyId,
            barcode: createProductDto.barcode,
          },
        },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    // Verify that category exists and belongs to the company
    if (createProductDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: createProductDto.categoryId,
          companyId,
        },
      });

      if (!category) {
        throw new BadRequestException('Category not found or does not belong to your company');
      }
    }

    // Verify that unit exists and belongs to the company
    const unit = await this.prisma.unit.findFirst({
      where: {
        id: createProductDto.unitId,
        companyId,
      },
    });

    if (!unit) {
      throw new BadRequestException('Unit not found or does not belong to your company');
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        companyId,
      },
      include: {
        category: true,
        unit: true,
        suppliers: {
          include: {
            supplier: true,
          },
        },
      },
    });
  }

  async findAll(companyId: string, query: QueryProductDto) {
    const {
      search,
      categoryId,
      productType,
      isActive,
      isPerishable,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.ProductWhereInput = {
      companyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(productType && { productType }),
      ...(isActive !== undefined && { isActive }),
      ...(isPerishable !== undefined && { isPerishable }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          category: true,
          unit: true,
          suppliers: {
            include: {
              supplier: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        category: true,
        unit: true,
        suppliers: {
          include: {
            supplier: true,
          },
        },
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    companyId: string,
    id: string,
    updateProductDto: UpdateProductDto,
  ) {
    // Verify product exists and belongs to company
    const product = await this.findOne(companyId, id);

    // Check if SKU is being updated and if it already exists
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: {
          companyId_sku: {
            companyId,
            sku: updateProductDto.sku,
          },
        },
      });

      if (existingSku) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Check if barcode is being updated and if it already exists
    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== product.barcode
    ) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: {
          companyId_barcode: {
            companyId,
            barcode: updateProductDto.barcode,
          },
        },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    // Verify category if being updated
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateProductDto.categoryId,
          companyId,
        },
      });

      if (!category) {
        throw new BadRequestException('Category not found or does not belong to your company');
      }
    }

    // Verify unit if being updated
    if (updateProductDto.unitId) {
      const unit = await this.prisma.unit.findFirst({
        where: {
          id: updateProductDto.unitId,
          companyId,
        },
      });

      if (!unit) {
        throw new BadRequestException('Unit not found or does not belong to your company');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        unit: true,
        suppliers: {
          include: {
            supplier: true,
          },
        },
      },
    });
  }

  async remove(companyId: string, id: string) {
    // Verify product exists and belongs to company
    await this.findOne(companyId, id);

    // Check if product has inventory
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        productId: id,
        quantity: {
          gt: 0,
        },
      },
    });

    if (inventory) {
      throw new BadRequestException(
        'Cannot delete product with existing inventory. Please remove all inventory first.',
      );
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async softDelete(companyId: string, id: string) {
    // Verify product exists and belongs to company
    await this.findOne(companyId, id);

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async restore(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
