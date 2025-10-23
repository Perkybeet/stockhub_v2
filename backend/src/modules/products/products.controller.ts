import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions('products:create')
  create(
    @CurrentUser('companyId') companyId: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(companyId, createProductDto);
  }

  @Get()
  @RequirePermissions('products:view')
  findAll(
    @CurrentUser('companyId') companyId: string,
    @Query() query: QueryProductDto,
  ) {
    return this.productsService.findAll(companyId, query);
  }

  @Get(':id')
  @RequirePermissions('products:view')
  findOne(
    @CurrentUser('companyId') companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.findOne(companyId, id);
  }

  @Patch(':id')
  @RequirePermissions('products:update')
  update(
    @CurrentUser('companyId') companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(companyId, id, updateProductDto);
  }

  @Delete(':id')
  @RequirePermissions('products:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser('companyId') companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.remove(companyId, id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('products:update')
  softDelete(
    @CurrentUser('companyId') companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.softDelete(companyId, id);
  }

  @Patch(':id/activate')
  @RequirePermissions('products:update')
  restore(
    @CurrentUser('companyId') companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.restore(companyId, id);
  }
}
