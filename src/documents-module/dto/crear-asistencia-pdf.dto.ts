export class CrearAsistenciaPdfDto {
  // Tipo de capacitación
  sistemaDocumental?: boolean;
  codigoDocumento?: string;
  version?: string;
  documentosAsociados?: string;
  taller?: boolean;
  curso?: boolean;
  otro?: boolean;
  
  // Origen
  interno?: boolean;
  externo?: boolean;
  
  // Información general
  grupoObjetivo: string;
  nombreCapacitacion: string;
  objetivoCapacitacion: string;
  nombreFacilitador: string;
  fechaCapacitacion: string;
  horario: string;
  horasCapacitacion: string;
  
  // Asistentes
  asistentes: Array<{
    nombre: string;
    area: string;
    nota?: string;
  }>;
  
  // Observaciones
  observaciones?: string;
}
