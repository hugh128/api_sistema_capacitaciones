import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('PLANTILLA_DOCUMENTO')
export class PlantillasModule {
  @PrimaryGeneratedColumn()
  ID_PLANTILLA: number;

  @Column({ type: 'nvarchar', length: 255 })
  NOMBRE_ARCHIVO: string;

  @Column({ type: 'nvarchar', length: 255 })
  NOMBRE_DISPLAY: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  DESCRIPCION: string;

  @Column({
    type: 'nvarchar',
    length: 10,
  })
  TIPO_DOCUMENTO: 'PDF' | 'DOCX' | 'DOC';

  @Column({ type: 'nvarchar', length: 1000 })
  URL_ARCHIVO: string;

  @Column({ type: 'bigint' })
  TAMANIO_BYTES: number;

  @Column({ type: 'bit', default: false })
  ACTIVO: boolean;

  @Column({ type: 'int', default: 1 })
  VERSION: number;

  @CreateDateColumn({ type: 'datetime' })
  FECHA_CREACION: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  FECHA_MODIFICACION: Date;

  @Column({ type: 'nvarchar' })
  CREADO_POR: string;

  @Column({ type: 'nvarchar', nullable: true })
  MODIFICADO_POR: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  NOTAS: string;

  @Column({
    type: 'nvarchar',
    length: 20,
    default: 'BORRADOR',
  })
  ESTADO: 'BORRADOR' | 'ACTIVO' | 'OBSOLETO';
}
