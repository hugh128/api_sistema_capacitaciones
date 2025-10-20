import { IsString, IsNotEmpty } from 'class-validator';


export class CreateTipoCapacitacionDto {

    @IsNotEmpty({ message: 'El estado es requerido.' })
    ESTADO?: boolean;

    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido.' })
    NOMBRE: string;

}
