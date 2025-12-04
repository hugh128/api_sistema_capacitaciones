import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, BadRequestException, UploadedFile, Put } from '@nestjs/common';
import { PlantillasModuleService } from './plantillas-module.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('plantillas-module')
export class PlantillasModuleController {
  constructor(
    private readonly plantillasModuleService: PlantillasModuleService
  ) {}

  @Get()
  async findAll() {
    return this.plantillasModuleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plantillasModuleService.findOne(id);
  }

  @Get('activa/predeterminada')
  async findActiva() {
    return this.plantillasModuleService.findActiva();
  }

  @Get('descargar/:id')
  async descargarPlantilla(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.plantillasModuleService.descargarPlantilla(id);
  }

  @Get('descargar/plantilla/predeterminada')
  async descargarPlantillaPredeterminada(
  ) {
    return this.plantillasModuleService.descargarPlantillaPredeterminada();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('archivo'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo PDF, DOC y DOCX',
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('El archivo no debe superar los 10 MB');
    }

    return this.plantillasModuleService.upload(file, {
      NOMBRE_DISPLAY: body.NOMBRE_DISPLAY,
      DESCRIPCION: body.DESCRIPCION,
      NOTAS: body.NOTAS,
      CREADO_POR: body.CREADO_POR,
    });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { NOMBRE_DISPLAY?: string; DESCRIPCION?: string; NOTAS?: string; MODIFICADO_POR: string },
  ) {
    return this.plantillasModuleService.update(id, updateData);
  }

  @Put(':id/replace')
  @UseInterceptors(FileInterceptor('archivo'))
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    return this.plantillasModuleService.replace(id, file, {
      NOMBRE_DISPLAY: body.NOMBRE_DISPLAY,
      DESCRIPCION: body.DESCRIPCION,
      NOTAS: body.NOTAS,
      MODIFICADO_POR: body.MODIFICADO_POR,
    });
  }

  @Post(':id/activar')
  async activar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { MODIFICADO_POR: string },
  ) {
    return this.plantillasModuleService.activar(id, body.MODIFICADO_POR);
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { ESTADO: string; MODIFICADO_POR: string },
  ) {
    const estadosValidos = ['BORRADOR', 'ACTIVO', 'OBSOLETO'];
    if (!estadosValidos.includes(body.ESTADO)) {
      throw new BadRequestException('Estado no válido');
    }

    return this.plantillasModuleService.cambiarEstado(
      id,
      body.ESTADO as 'ACTIVO' | 'BORRADOR' | 'OBSOLETO',
      body.MODIFICADO_POR,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.plantillasModuleService.remove(id);
  }

}
