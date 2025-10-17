import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Documento } from 'src/documento/entities/documento.entity';

@Entity('DOCUMENTO_ASOCIADO')
export class DocumentoAsociado {
    @PrimaryGeneratedColumn({ name: 'ID_DOC_ASOCIADO' })
    ID_DOC_ASOCIADO: number;

    @Column({ name: 'CODIGO', length: 20 })
    CODIGO: string;

    @Column({ name: 'NOMBRE_DOCUMENTO', length: 255 })
    NOMBRE_DOCUMENTO: string;

    @Column({ name: 'FECHA_APROBACION', type: 'date', nullable: true })
    FECHA_APROBACION: Date | null;

    @Column({ name: 'VERSION', default: 1 })
    VERSION: number;

    @Column({ name: 'ESTATUS', length: 20 })
    ESTATUS: string;
    
    @Column({ name: 'DOCUMENTO_ID', nullable: true })
    DOCUMENTO_ID: number; 

    @ManyToOne(() => Documento, (padre) => padre.DOCUMENTOS_ASOCIADOS)
    @JoinColumn({ name: 'DOCUMENTO_ID' })
    DOCUMENTO_PADRE: Documento;
}
