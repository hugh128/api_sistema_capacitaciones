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

    @Column({ name: 'ESTATUS', type: 'bit', default: true })
    ESTATUS: boolean;
    
    @Column({ name: 'DOCUMENTO_ID', nullable: true })
    DOCUMENTO_ID: number; 

    @ManyToOne(() => Documento, (padre) => padre.DOCUMENTOS_ASOCIADOS)
    @JoinColumn({ name: 'DOCUMENTO_ID' })
    DOCUMENTO_PADRE: Documento;
}
