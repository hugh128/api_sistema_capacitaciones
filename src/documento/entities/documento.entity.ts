import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DocumentoAsociado } from 'src/documento-asociado/entities/documento-asociado.entity';

@Entity('DOCUMENTO')
export class Documento {
    @PrimaryGeneratedColumn({ name: 'ID_DOCUMENTO' })
    ID_DOCUMENTO: number;

    @Column({ name: 'CODIGO', length: 20, unique: true })
    CODIGO: string;

    @Column({ name: 'TIPO_DOCUMENTO', length: 10 })
    TIPO_DOCUMENTO: string;

    @Column({ name: 'NOMBRE_DOCUMENTO', length: 255 })
    NOMBRE_DOCUMENTO: string;

    @Column({ name: 'VERSION', type: 'int', default: 1, nullable: false })
    VERSION: number;

    @Column({ name: 'APROBACION', type: 'date', nullable: true })
    APROBACION: Date | null;

    @Column({ name: 'ESTATUS', type: 'bit', default: true })
    ESTATUS: boolean;

    @OneToMany(() => DocumentoAsociado, (hijo) => hijo.DOCUMENTO_PADRE)
    DOCUMENTOS_ASOCIADOS: DocumentoAsociado[];
}
