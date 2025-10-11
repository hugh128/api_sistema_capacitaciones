import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength} from 'class-validator';    
export class CreateDocumentoAsociadoDto {
    @IsString()
    @IsNotEmpty({ message: 'El código del documento asociado es obligatorio.' })
    @MaxLength(20)    
    CODIGO: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre del documento asociado es obligatorio.' })
    @MaxLength(255)
    NOMBRE_DOCUMENTO: string;

    @IsNumber()
    @IsOptional()
    DOCUMENTO_ID?: number;

    @IsBoolean()
    @IsNotEmpty({ message: 'El estatus del documento asociado es obligatorio.' })   
    ESTATUS?: boolean;  

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