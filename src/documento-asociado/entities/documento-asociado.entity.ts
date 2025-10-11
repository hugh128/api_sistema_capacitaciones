import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
export class DocumentoAsociado {
    @PrimaryGeneratedColumn({ name: 'ID_DOC_ASOCIADO' })
    ID_DOC_ASOCIADO: number;

    @Column({ name: 'CODIGO', type: 'varchar', length: 20, nullable: false })       
    CODIGO: string;

    @Column({ name: 'NOMBRE_DOCUMENTO', type: 'varchar', length: 255, nullable: false })        
    NOMBRE_DOCUMENTO: string;

    @Column({ name: 'DOCUMENTO_ID', type: 'int', nullable: true })  
    DOCUMENTO_ID?: number;

    @Column({ name: 'ESTATUS', type: 'bit', default: 1, nullable: false })
    ESTATUS: boolean;   
}
/*
CREATE TABLE DOCUMENTO_ASOCIADO(
	ID_DOC_ASOCIADO INT IDENTITY (1,1) PRIMARY KEY,
	CODIGO VARCHAR(20) NOT NULL,
	NOMBRE_DOCUMENTO VARCHAR(255) NOT NULL,
	DOCUMENTO_ID INT NULL,
	ESTATUS BIT NOT NULL DEFAULT 1,
	FOREIGN KEY (DOCUMENTO_ID) REFERENCES DOCUMENTO(ID_DOCUMENTO)
);

*/