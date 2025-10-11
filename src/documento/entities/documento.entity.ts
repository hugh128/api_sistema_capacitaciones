import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('DOCUMENTO')
export class Documento {
    @PrimaryGeneratedColumn({ name: 'ID_DOCUMENTO' })
    ID_DOCUMENTO: number;

    @Column({ name: 'CODIGO', type: 'varchar', length: 20, nullable: false, unique: true })
    CODIGO: string;

    @Column({ name: 'TIPO_DOCUMENTO', type: 'varchar', length: 10, nullable: false })
    TIPO_DOCUMENTO: string;

    @Column({ name: 'NOMBRE_DOCUMENTO', type: 'varchar', length: 255, nullable: false })
    NOMBRE_DOCUMENTO: string;

    @Column({ name: 'APROBACION', type: 'date', nullable: true })
    APROBACION: Date;
    
    @Column({ name: 'ESTATUS', type: 'bit', default: 1, nullable: false })
    ESTATUS: boolean;

}
/**
 CREATE TABLE DOCUMENTO(
	ID_DOCUMENTO INT IDENTITY (1,1) PRIMARY KEY,
	CODIGO VARCHAR(20) NOT NULL,
	TIPO_DOCUMENTO VARCHAR(10) NOT NULL,
	NOMBRE_DOCUMENTO VARCHAR(255) NOT NULL,
	APROBACION DATE NULL,
	ESTATUS BIT NOT NULL DEFAULT 1,
	CONSTRAINT UQ_CODIGO UNIQUE (CODIGO)
);
*/