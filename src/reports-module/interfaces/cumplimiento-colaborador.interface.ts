export interface CumplimientoColaborador {
  ID_COLABORADOR: number;
  COLABORADOR: string;
  CODIGO_DEPARTAMENTO: string;
  DEPARTAMENTO: string;
  PUESTO: string;
  Plan: string;
  'Total Capacitaciones': number;
  Completadas: number;
  'En Progreso': number;
  Pendientes: number;
  Reprobadas: number;
  '% Cumplimiento': number;
  'Estado Plan': string;
  'Fecha Inicio Plan': string;
  'Última Capacitación': string | null;
  'Días desde inicio': number;
}
