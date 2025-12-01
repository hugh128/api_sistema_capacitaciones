import { HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsuarioService } from "src/usuario/usuario.service";
import { JwtService } from "@nestjs/jwt";
import { HashingService } from "src/common/hashing.service";
import { DatabaseErrorService } from "src/common/database-error.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingService,
    private readonly databaseErrorService: DatabaseErrorService,
  ) {}

  async login(username: string, password: string) {
    try {
      const usuario = await this.usuarioService.findByUsername(username);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (!usuario.ESTADO) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      const isPasswordValid = await this.hashingService.compare(password, usuario.PASSWORD);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales invalidas');
      }

      const rolesProyectados = usuario.USUARIO_ROLES.map(uRol => {
        const rol = uRol.ROL;

        const PERMISOS_PROYECTADOS = rol.ROL_PERMISOS.map(rPermiso => ({
            ID: rPermiso.PERMISO.ID_PERMISO,
            NOMBRE: rPermiso.PERMISO.NOMBRE, 
            CLAVE: rPermiso.PERMISO.CLAVE,
        }));
        
        return {
            ID: rol.ID_ROL,
            NOMBRE: rol.NOMBRE,
            PERMISOS: PERMISOS_PROYECTADOS,
        };
    });
      
      const rolNames = rolesProyectados.map(r => r.NOMBRE);
      const permisoClaves = [...new Set(
        rolesProyectados.flatMap(r => r.PERMISOS.map(p => p.CLAVE))
      )];


      const payload = { 
        username: usuario.USERNAME, 
        sub: usuario.ID_USUARIO, 
        roles: rolNames,
        permissions: permisoClaves
      };

      const token = this.jwtService.sign(payload); 

      const usuarioAuth = {
        ID_USUARIO: usuario.ID_USUARIO,
        USERNAME: usuario.USERNAME,
        ESTADO: usuario.ESTADO,
        
        NOMBRE: usuario.PERSONA.NOMBRE,
        APELLIDO: usuario.PERSONA.APELLIDO,
        CORREO: usuario.PERSONA.CORREO,
        TELEFONO: usuario.PERSONA.TELEFONO,
        DPI: usuario.PERSONA.DPI,
        
        PUESTO_NOMBRE: usuario.PERSONA.PUESTO?.NOMBRE || null,
        DEPARTAMENTO_NOMBRE: usuario.PERSONA.DEPARTAMENTO?.NOMBRE || null,
        
        ROLES: rolesProyectados,
        PERSONA_ID: usuario.PERSONA_ID
      };

      return { 
        MESSAGE: "Inicio de sesion exitoso",
        USUARIO: { DATA: usuarioAuth, TOKEN: token } 
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.databaseErrorService.handle(error);
    }
  }
}
