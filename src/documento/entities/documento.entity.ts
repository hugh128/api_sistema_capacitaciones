import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { DocumentoAsociado } from 'src/documento-asociado/entities/documento-asociado.entity';
import { Departamento } from 'src/departamento/entities/departamento.entity';

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

    @Column({ name: 'APROBACION', type: 'date', nullable: true })
    APROBACION: Date | null;

    @Column({ name: 'VERSION', type: 'int', default: 1, nullable: false })
    VERSION: number;

    @Column({ name: 'ESTATUS', length: 20, nullable: false })
    ESTATUS: string;

    @Column({ name: 'DEPARTAMENTO_CODIGO', length: 20, nullable: false })
    DEPARTAMENTO_CODIGO: string;

    @OneToMany(() => DocumentoAsociado, (hijo) => hijo.DOCUMENTO_PADRE)
    DOCUMENTOS_ASOCIADOS: DocumentoAsociado[];

    @ManyToOne(() => Departamento, (departamento) => departamento.DOCUMENTOS)
    @JoinColumn({ 
        name: 'DEPARTAMENTO_CODIGO',
        referencedColumnName: 'CODIGO'
    })
    DEPARTAMENTO: Departamento;
}
