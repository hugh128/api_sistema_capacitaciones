import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { IsInt, ArrayMinSize, ArrayUnique } from 'class-validator';

export class CreateRolDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    NOMBRE: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    DESCRIPCION: string;

    @IsOptional()
    ESTADO?: boolean;
    
    @IsInt({ each: true })
    @ArrayMinSize(1, { message: 'Se debe asignar al menos un permiso.' })
    @ArrayUnique()
    ID_PERMISOS: number[];
}
