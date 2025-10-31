import { Injectable, StreamableFile, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento } from '../documento/entities/documento.entity';
import { DocumentoAsociado } from '../documento-asociado/entities/documento-asociado.entity';
import { Departamento } from 'src/departamento/entities/departamento.entity'; 
import { generarInduccionDocumentalPdf, InduccionData } from './templates/induccion-documental.template';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as fs from 'fs';
import { Persona } from 'src/persona/entities/persona.entity';
import { Puesto } from 'src/puesto/entities/puesto.entity';
import { colaboradorCapacitado, documentoPadre, documentosAsociados, generarListadoAsistenciaPdf } from './templates/listado-asistencia.template';
import { CharsetToEncoding } from 'mysql2';
import { FormatoAsistenciaFrontendDto } from './dto/formato-asistencia.dto';
import { formatoAsistencia } from './templates/listado-asistencia.template';
@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(Documento) private readonly documentoRepo: Repository<Documento>,
    @InjectRepository(DocumentoAsociado) private readonly docAsociadoRepo: Repository<DocumentoAsociado>,
    
  ) {}

  async generarInduccionDocumental(idDocumento: number): Promise<StreamableFile> {
    //Traer documento principal
    const documento = await this.documentoRepo.findOne({ where: { ID_DOCUMENTO: idDocumento } });
    if (!documento) throw new Error('Documento no encontrado');

    //Traer documentos asociados
    const asociados = await this.docAsociadoRepo.find({ where: { DOCUMENTO_PADRE: { ID_DOCUMENTO: idDocumento } } });
    //Traer departamento


    // 3) Traer datos colaborador (ejemplo: reemplazar por consulta a tabla Usuario si aplica)
    // Aquí debes reemplazar por tu repo usuario o la relación que tengas:
    const colaborador = 'Nombre del Colaborador';
    const puesto = 'Nombre del Puesto';
    const departamento = 'Nombre del Departamento';
    const jefe = 'Nombre del Jefe Inmediato';

    //Mapear
    const datos: InduccionData = {
      titulo:  'INDUCCIÓN DOCUMENTAL AL PUESTO',
      codigo: (documento as any).CODIGO ?? '—',
      version: (documento as any).VERSION ?? (documento as any).TIPO_DOCUMENTO ?? '—',
      fechaEmision: documento.APROBACION ? new Date(documento.APROBACION).toLocaleDateString() : '—',
      fechaRevision: (documento as any).FECHA_PROXIMA_REVISION ?? '—',
      departamento,
      fecha: new Date().toLocaleDateString(),
      cargo: puesto,
      colaborador,
      jefeInmediato: jefe,
      documentos: asociados.map((a, idx) => ({
        no: idx + 1,
        nombre: a.NOMBRE_DOCUMENTO,
        codigo: a.CODIGO,
        version: (a as any).VERSION ?? '—',
        fecha: (a as any).APROBACION ? new Date((a as any).APROBACION).toLocaleDateString() : '—',
        lectura: (a as any).LECTURA ? 'x' : '',
        capacitacion: (a as any).CAPACITACION ? 'x' : '',
        evaluacion: (a as any).EVALUACION ? 'x' : '',
        calificacion: (a as any).CALIFICACION?.toString() ?? '',
        facilitador: (a as any).FACILITADOR ?? '',
        firmaColaborador: '', 
        estatus: a.ESTATUS ? 'Completa' : 'Incompleta',
      })),
    };

    //Generar buffer
    const pdfBuffer = await generarInduccionDocumentalPdf(datos);

    // Guardar temporal y devolver como StreamableFile
    const tmpDir = join(process.cwd(), 'temp');
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
    const outPath = join(tmpDir, `induccion_${idDocumento}.pdf`);
    await new Promise<void>((resolve, reject) => {
      const w = createWriteStream(outPath);
      w.on('finish', () => resolve());
      w.on('error', (e) => reject(e));
      w.write(Buffer.from(pdfBuffer));
      w.end();
    });

    return new StreamableFile(fs.createReadStream(outPath));
  }

   async generarListadoAsistencia(datos:FormatoAsistenciaFrontendDto): Promise<StreamableFile> {
    if (!datos) throw new BadRequestException('No se recibieron datos para generar el PDF.');

    if (!datos.capacitados?.length) throw new BadRequestException('Debe enviar al menos un colaborador capacitado.');

    if (!datos.documentoPadre || !datos.documentosAsociados?.length) throw new BadRequestException('Faltan datos del documento padre o los documentos asociados.');

    //campos fijos
    const tituloFijo = 'CAPACITACION DE PERSONAL';
    const codigoFijo = 'RRHH-REG-001';
    const versionFijo = '4';
    const orientationFijo: 'portrait' | 'landscape' = 'portrait';

    // 
    const datosPdf: formatoAsistencia = {
      titulo: tituloFijo,
      codigo: codigoFijo,
      version: versionFijo,
      orientation: orientationFijo,
      fechaEmision: datos.fechaEmision,
      fechaProximaRevision: datos.fechaProximaRevision,
      tipoCapacitacion: datos.tipoCapacitacion,
      documentoPadre: datos.documentoPadre,
      documentosAsociados: datos.documentosAsociados,
      grupoObjetivo: datos.grupoObjetivo,
      nombreCapacitacion: datos.nombreCapacitacion,
      objetivoCapacitacion: datos.objetivoCapacitacion,
      nombreFacilitador: datos.nombreFacilitador,
      fechaCapacitacion: datos.fechaCapacitacion,
      horario: datos.horario,
      instruccion: datos.instruccion,
      capacitados: datos.capacitados,
    };
  // Llamar al template que genera el PDF
  const pdfBuffer: Uint8Array = await generarListadoAsistenciaPdf(datosPdf);

    // Creacion de la carpeta temporal para guardar el archivo generado
    const tmpDir = join(process.cwd(), 'temp');
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

    const outPath = join(tmpDir, 'listado_de_asistencia.pdf');

    // Guardar el buffer en disco (temporal)
    await new Promise<void>((resolve, reject) => {
      const w = createWriteStream(outPath);
      w.on('finish', () => resolve());
      w.on('error', (e) => reject(e));
      w.write(Buffer.from(pdfBuffer));
      w.end();
    });

    // Retornar el PDF como StreamableFile
    return new StreamableFile(fs.createReadStream(outPath));
  }
}
