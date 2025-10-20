import{
    IsDateString,
    IsInt, IsNotEmpty, IsString
}from 'class-validator'

export class CreateCapacitacionDto {
    
    @IsString()
    @IsNotEmpty({ message: 'El CODIGO es requerido para crear una capacitacion'})
    CODIGO:string;

    @IsString()
    @IsNotEmpty({message: 'El nombre de la capacitacion es requerida para crear una capacitacion'})
    NOMBRE_CAPACITACION:string;

    @IsString()
    DESCRIPCION: string;

    @IsInt()
    @IsNotEmpty({ message:'El tipo de capacitacion es requerido'})
    TIPO_CAPACITACION_ID: number;

    @IsDateString()
    FECHA_INICIO: Date;

    @IsDateString()
    FECHA_FIN: Date;

    @IsNotEmpty({ message:'El estado es requerido'})
    ESTADO: boolean;

    @IsString()
    @IsNotEmpty({ message: 'El id del usuario capacitador es requerido para crear la capacitacion'})
    USUARIO_ID: string;

    @IsString()
    PLAN_ASOCIADO: string;

    @IsNotEmpty({message: 'Es requerido que indique si aplica examen'})
    APLICA_EXAMEN: boolean;

    @IsInt()
    PUNTAJE_MINIMO: number;

    @IsNotEmpty({message: 'Es requerido que indique si aplica a diploma'})
    APLICA_DIPLOMA:boolean;

    @IsInt()
    DOCUMENTO_ASOCIADO:number;

    @IsInt()
    @IsNotEmpty({message:'El id del departamento es requerido para crear la capacitacion'})
    DEPARTAMENTO_ID:number;

}
