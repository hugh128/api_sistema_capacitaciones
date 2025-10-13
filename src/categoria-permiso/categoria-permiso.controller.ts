import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriaPermisoService } from './categoria-permiso.service';
import { CreateCategoriaPermisoDto } from './dto/create-categoria-permiso.dto';
import { UpdateCategoriaPermisoDto } from './dto/update-categoria-permiso.dto';

@Controller('categoria-permiso')
export class CategoriaPermisoController {
  constructor(private readonly categoriaPermisoService: CategoriaPermisoService) {}

  @Post()
  create(@Body() createCategoriaPermisoDto: CreateCategoriaPermisoDto) {
    return this.categoriaPermisoService.create(createCategoriaPermisoDto);
  }

  @Get()
  findAll() {
    return this.categoriaPermisoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriaPermisoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaPermisoDto: UpdateCategoriaPermisoDto) {
    return this.categoriaPermisoService.update(+id, updateCategoriaPermisoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriaPermisoService.remove(+id);
  }
}
