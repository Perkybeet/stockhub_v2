import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(companyId: string) {
    // Total de productos
    const totalProducts = await this.prisma.product.count({
      where: { 
        companyId,
        isActive: true 
      },
    });

    // Total de productos del mes pasado para calcular el cambio
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const totalProductsLastMonth = await this.prisma.product.count({
      where: { 
        companyId,
        isActive: true,
        createdAt: { lte: lastMonthDate }
      },
    });

    const productsChangeNum = totalProductsLastMonth > 0 
      ? ((totalProducts - totalProductsLastMonth) / totalProductsLastMonth * 100)
      : 0;
    const productsChange = productsChangeNum.toFixed(1);

    // Total de almacenes
    const totalWarehouses = await this.prisma.warehouse.count({
      where: { 
        companyId,
        isActive: true
      },
    });

    const totalWarehousesLastMonth = await this.prisma.warehouse.count({
      where: { 
        companyId,
        isActive: true,
        createdAt: { lte: lastMonthDate }
      },
    });

    const warehousesChange = totalWarehouses - totalWarehousesLastMonth;

    // Productos con stock bajo (usando minStockLevel del producto)
    const productsWithInventory = await this.prisma.product.findMany({
      where: {
        companyId,
        isActive: true,
        minStockLevel: { not: null }
      },
      select: {
        id: true,
        minStockLevel: true,
        inventory: {
          select: {
            quantity: true
          }
        }
      }
    });

    const lowStockProducts = productsWithInventory.filter(product => {
      const totalQuantity = product.inventory.reduce((sum, inv) => 
        sum + (inv.quantity ? Number(inv.quantity) : 0), 0
      );
      const minStock = product.minStockLevel ? Number(product.minStockLevel) : 0;
      return totalQuantity <= minStock;
    }).length;

    const lowStockChange = 0; // Simplificado por ahora

    // Órdenes de compra pendientes
    const pendingOrders = await this.prisma.purchaseOrder.count({
      where: {
        companyId,
        status: { in: ['pending', 'approved', 'ordered'] }
      }
    });

    const pendingOrdersLastMonth = await this.prisma.purchaseOrder.count({
      where: {
        companyId,
        status: { in: ['pending', 'approved', 'ordered'] },
        createdAt: { lte: lastMonthDate }
      }
    });

    const ordersChange = pendingOrders - pendingOrdersLastMonth;

    // Valor total del inventario
    const inventoryItems = await this.prisma.inventory.findMany({
      where: {
        companyId
      },
      select: {
        quantity: true,
        product: {
          select: {
            costPrice: true
          }
        }
      }
    });

    const inventoryValue = inventoryItems.reduce((total, item) => {
      const quantity = item.quantity ? Number(item.quantity) : 0;
      const cost = item.product.costPrice ? Number(item.product.costPrice) : 0;
      return total + (quantity * cost);
    }, 0);

    return {
      totalProducts,
      productsChange: `${productsChangeNum > 0 ? '+' : ''}${productsChange}%`,
      totalWarehouses,
      warehousesChange: warehousesChange > 0 ? `+${warehousesChange}` : `${warehousesChange}`,
      lowStockProducts,
      lowStockChange: `${lowStockChange > 0 ? '+' : ''}${lowStockChange}`,
      pendingOrders,
      ordersChange: `${ordersChange > 0 ? '+' : ''}${ordersChange}`,
      inventoryValue: inventoryValue.toFixed(2)
    };
  }

  async getRecentActivity(companyId: string, limit = 10) {
    // Obtener movimientos de stock recientes
    const recentMovements = await this.prisma.stockMovement.findMany({
      where: {
        companyId
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        },
        warehouse: {
          select: {
            name: true
          }
        },
        performedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        performedAt: 'desc'
      },
      take: limit
    });

    return recentMovements.map(movement => ({
      id: movement.id,
      type: this.getActivityType(movement.movementType),
      title: this.getActivityTitle(movement.movementType),
      description: `${movement.product.name} (${movement.product.sku}) - ${movement.warehouse.name}`,
      quantity: Number(movement.quantity),
      time: this.formatRelativeTime(movement.performedAt),
      user: `${movement.performedBy.firstName} ${movement.performedBy.lastName}`
    }));
  }

  private getActivityType(movementType: string): string {
    const typeMap: Record<string, string> = {
      'purchase': 'success',
      'sale': 'info',
      'transfer_in': 'success',
      'transfer_out': 'info',
      'adjustment_increase': 'warning',
      'adjustment_decrease': 'warning',
      'return': 'info',
      'damage': 'error',
      'expired': 'error',
      'production': 'success',
      'consumption': 'info'
    };
    return typeMap[movementType] || 'info';
  }

  private getActivityTitle(movementType: string): string {
    const titleMap: Record<string, string> = {
      'purchase': 'Entrada por Compra',
      'sale': 'Salida por Venta',
      'transfer_in': 'Entrada por Transferencia',
      'transfer_out': 'Salida por Transferencia',
      'adjustment_increase': 'Ajuste de Incremento',
      'adjustment_decrease': 'Ajuste de Reducción',
      'return': 'Devolución',
      'damage': 'Daño/Pérdida',
      'expired': 'Expirado',
      'production': 'Producción',
      'consumption': 'Consumo'
    };
    return titleMap[movementType] || movementType;
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  }

  async getStockAlerts(companyId: string, limit = 10) {
    const alerts = await this.prisma.stockAlert.findMany({
      where: {
        companyId,
        isResolved: false
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        },
        warehouse: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return alerts.map(alert => ({
      id: alert.id,
      type: alert.alertType,
      severity: alert.severity,
      title: this.getAlertTitle(alert.alertType),
      message: `${alert.product.name} (${alert.product.sku})${alert.warehouse ? ` en ${alert.warehouse.name}` : ''}`,
      time: this.formatRelativeTime(alert.createdAt)
    }));
  }

  private getAlertTitle(alertType: string): string {
    const titleMap: Record<string, string> = {
      'low_stock': 'Stock Bajo',
      'out_of_stock': 'Sin Stock',
      'expiring_soon': 'Por Vencer',
      'expired': 'Expirado',
      'overstock': 'Sobre Stock'
    };
    return titleMap[alertType] || alertType;
  }

  async getInventoryByCategory(companyId: string) {
    const categories = await this.prisma.category.findMany({
      where: {
        companyId,
        isActive: true
      },
      select: {
        name: true,
        products: {
          where: {
            isActive: true
          },
          select: {
            costPrice: true,
            inventory: {
              select: {
                quantity: true
              }
            }
          }
        }
      }
    });

    return categories.map(category => {
      let totalQuantity = 0;
      let totalValue = 0;

      category.products.forEach(product => {
        const productQuantity = product.inventory.reduce((sum, inv) => 
          sum + (inv.quantity ? Number(inv.quantity) : 0), 0
        );
        totalQuantity += productQuantity;
        
        // Calcular valor usando el precio de costo del producto
        const costPrice = product.costPrice ? Number(product.costPrice) : 0;
        totalValue += productQuantity * costPrice;
      });

      return {
        category: category.name,
        quantity: Math.round(totalQuantity),
        value: Math.round(totalValue * 100) / 100, // Redondear a 2 decimales
        products: category.products.length
      };
    }).filter(cat => cat.quantity > 0 || cat.value > 0);
  }

  async getMonthlyMovements(companyId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const movements = await this.prisma.stockMovement.findMany({
      where: {
        companyId,
        performedAt: { gte: sixMonthsAgo }
      },
      select: {
        movementType: true,
        quantity: true,
        performedAt: true
      }
    });

    // Agrupar por mes
    const monthlyData: Record<string, { in: number; out: number; adjustment: number; transfer: number }> = {};

    movements.forEach(movement => {
      const month = movement.performedAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { in: 0, out: 0, adjustment: 0, transfer: 0 };
      }

      const quantity = Number(movement.quantity);
      
      if (['purchase', 'return', 'production'].includes(movement.movementType)) {
        monthlyData[month].in += quantity;
      } else if (['sale', 'consumption', 'damage', 'expired'].includes(movement.movementType)) {
        monthlyData[month].out += quantity;
      } else if (['adjustment_increase', 'adjustment_decrease'].includes(movement.movementType)) {
        monthlyData[month].adjustment += quantity;
      } else if (['transfer_in', 'transfer_out'].includes(movement.movementType)) {
        monthlyData[month].transfer += quantity;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  async getTopProducts(companyId: string, limit = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await this.prisma.product.findMany({
      where: {
        companyId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stockMovements: {
          where: {
            performedAt: { gte: thirtyDaysAgo }
          },
          select: {
            quantity: true
          }
        }
      }
    });

    const productsWithActivity = products.map(product => {
      const totalMovements = product.stockMovements.length;
      const totalQuantity = product.stockMovements.reduce((sum, mov) => 
        sum + Math.abs(Number(mov.quantity)), 0
      );

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        movements: totalMovements,
        quantity: Math.round(totalQuantity)
      };
    }).filter(p => p.movements > 0)
      .sort((a, b) => b.movements - a.movements)
      .slice(0, limit);

    return productsWithActivity;
  }

  async getWarehouseStock(companyId: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: {
        companyId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        inventory: {
          select: {
            quantity: true,
            productId: true
          }
        }
      }
    });

    return warehouses.map(warehouse => {
      const uniqueProducts = new Set(warehouse.inventory.map(inv => inv.productId)).size;
      const totalQuantity = warehouse.inventory.reduce((sum, inv) => 
        sum + (inv.quantity ? Number(inv.quantity) : 0), 0
      );

      return {
        warehouse: warehouse.name,
        products: uniqueProducts,
        quantity: Math.round(totalQuantity)
      };
    });
  }
}
