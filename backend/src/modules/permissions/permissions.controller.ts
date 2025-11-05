import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('roles.read') // Anyone who can manage roles can see permissions
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('resource') resource?: string,
  ) {
    return this.permissionsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 100,
      search,
      resource,
    );
  }

  @Get('grouped')
  @RequirePermissions('roles.read')
  async getGroupedByResource() {
    return this.permissionsService.getGroupedByResource();
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }
}
