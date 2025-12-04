import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePlanCapacitacionDto } from './dto/create-plan-capacitacion.dto';
import { UpdatePlanCapacitacionDto } from './dto/update-plan-capacitacion.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PlanCapacitacion } from './entities/plan-capacitacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';
import { CambiarPlanCapacitacionDto } from './dto/cambiar-plan-capacitacion.dto';

@Injectable()
export class PlanCapacitacionService {

  constructor(@InjectRepository(PlanCapacitacion)
    private planCapacitacionRepository: Repository<PlanCapacitacion>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService,
    private readonly dataSource: DataSource,
  ) {}

  private getIdsString(ids: (number | string)[]): string {
    return ids.map(id => String(id)).join(',');
  }

  async create(createPlanCapacitacionDto: CreatePlanCapacitacionDto) {
  
    const {
      NOMBRE,
      DESCRIPCION,
      TIPO,
      DEPARTAMENTO_ID,
      APLICA_TODOS_PUESTOS_DEP,
      ESTADO,
      ID_PUESTOS,
      ID_DOCUMENTOS
    } = createPlanCapacitacionDto;
    
    return this.entityManager.transaction(async manager => {
      try {
        const planResult = await manager.query(
          `EXEC sp_PLAN_CAPACITACION_ALTA
            @NOMBRE = @0,
            @DESCRIPCION = @1,
            @TIPO = @2,
            @DEPARTAMENTO_ID = @3,
            @APLICA_TODOS_PUESTOS_DEP = @4,
            @ESTADO = @5
            `,
          [
            NOMBRE,
            DESCRIPCION,
            TIPO,
            DEPARTAMENTO_ID,
            APLICA_TODOS_PUESTOS_DEP,
            ESTADO
          ]
        );

        const planId = planResult[0].ID_PLAN_CAPACITACION;

        if (ID_PUESTOS.length > 0) {
          const puestosString = this.getIdsString(ID_PUESTOS);
          await manager.query(
            `EXEC sp_PLAN_PUESTO_SINCRONIZAR
              @ID_PLAN = @0,
              @PUESTO_IDS_STRING = @1`,
            [
              planId,
              puestosString
            ]
          );
        }

        if (ID_DOCUMENTOS.length > 0) {
          const documentosString = this.getIdsString(ID_DOCUMENTOS);
          await manager.query(
            `EXEC sp_DOCUMENTO_PLAN_SINCRONIZAR
              @ID_PLAN = @0,
              @DOCUMENTO_IDS_STRING = @1`,
            [
              planId,
              documentosString
            ]
          );
        }
        
        return planId;

      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });

  }

  async findAll() {
    try {
      const planes = await this.planCapacitacionRepository.find({
        relations: {
          DEPARTAMENTO: true,
          PLANES_PUESTOS: {
            PUESTO: true
          },
          DOCUMENTOS_PLANES: {
            DOCUMENTO: true
          }
        },
        order: {
          FECHA_CREACION: 'desc'
        }
      });

      return planes.map(plan => ({
        ID_PLAN: plan.ID_PLAN,
        NOMBRE: plan.NOMBRE,
        DESCRIPCION: plan.DESCRIPCION,
        TIPO: plan.TIPO,
        DEPARTAMENTO_ID: plan.DEPARTAMENTO_ID,
        APLICA_TODOS_PUESTOS_DEP: plan.APLICA_TODOS_PUESTOS_DEP,
        FECHA_CREACION: plan.FECHA_CREACION,
        ESTADO: plan.ESTADO,
        DEPARTAMENTO: plan.DEPARTAMENTO,
        
        PLANES_PUESTOS: plan.PLANES_PUESTOS.map(pp => pp.PUESTO),
        
        DOCUMENTOS_PLANES: plan.DOCUMENTOS_PLANES.map(dp => dp.DOCUMENTO)
      }));

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async findOne(id: number) {
    try {
      const plan =  await this.planCapacitacionRepository.findOne({
        where: {
          ID_PLAN: id,
        },
        relations: {
          DEPARTAMENTO: true,
          PLANES_PUESTOS: true,
          DOCUMENTOS_PLANES: true
        }
      });

      return plan;
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async obtenerDetallePlanConColaboradores(idPlan: number) {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_PLAN', idPlan)
        .execute('SP_OBTENER_PLAN_CON_COLABORADORES');
      
      return {
        DETALLE_PLAN: result.recordsets[0]?.[0] || null,
        COLABORADORES_PLAN: result.recordsets[1] || [],
        CAPACITACIONES_PLAN: result.recordsets[2] || []
      };

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async update(id: number, updatePlanCapacitacionDto: UpdatePlanCapacitacionDto) {
    const {
      NOMBRE,
      DESCRIPCION,
      TIPO,
      DEPARTAMENTO_ID,
      APLICA_TODOS_PUESTOS_DEP,
      ESTADO,
      ID_PUESTOS,
      ID_DOCUMENTOS
    } = updatePlanCapacitacionDto;
    
    return this.entityManager.transaction(async manager => {
      try {
        const planCapacitacionData = await manager.query(
          `EXEC sp_PLAN_CAPACITACION_ACTUALIZAR
            @ID_PLAN = @0,
            @NOMBRE = @1,
            @DESCRIPCION = @2,
            @TIPO = @3,
            @DEPARTAMENTO_ID = @4,
            @APLICA_TODOS_PUESTOS_DEP = @5,
            @ESTADO = @6
            `,
          [
            id,
            NOMBRE,
            DESCRIPCION,
            TIPO,
            DEPARTAMENTO_ID,
            APLICA_TODOS_PUESTOS_DEP,
            ESTADO,
          ]
        );
        
        const spResult = planCapacitacionData[0];
        if (spResult && spResult.Success === 0) {
            throw new ConflictException(spResult.Message);
        }
        
        const puestosString = this.getIdsString(ID_PUESTOS || []);
        await manager.query(
            `EXEC sp_PLAN_PUESTO_SINCRONIZAR
              @ID_PLAN = @0,
              @PUESTO_IDS_STRING = @1`,
            [
              id,
              puestosString
            ]
        );

        const documentosString = this.getIdsString(ID_DOCUMENTOS || []);
        await manager.query(
            `EXEC sp_DOCUMENTO_PLAN_SINCRONIZAR
              @ID_PLAN = @0,
              @DOCUMENTO_IDS_STRING = @1`,
            [
              id,
              documentosString
            ]
        );
        
        
        return { message: 'Plan y sus detalles actualizado.', id: id };

      } catch (error) {
        this.databaseErrorService.handle(error);
      }
    });
  }

  remove(id: number) {
    return `This action removes a #${id} planCapacitacion`;
  }

  async verificarCambioPlan(dto: CambiarPlanCapacitacionDto) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_ACTUALIZAR_COLABORADOR_VERIFICAR_PLAN
          @ID_COLABORADOR = @0,
          @NUEVO_DEPARTAMENTO_ID = @1,
          @NUEVO_PUESTO_ID = @2`,
        [
          dto.ID_COLABORADOR,
          dto.NUEVO_DEPARTAMENTO_ID,
          dto.NUEVO_PUESTO_ID
        ]
      );

      return result[0] || {};
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async analizarCambioPlan(dto: CambiarPlanCapacitacionDto) {
    try {
      const pool = (this.dataSource.driver as any).master;
      
      const result = await pool.request()
        .input('ID_COLABORADOR', dto.ID_COLABORADOR)
        .input('NUEVO_DEPARTAMENTO_ID', dto.NUEVO_DEPARTAMENTO_ID)
        .input('NUEVO_PUESTO_ID', dto.NUEVO_PUESTO_ID)
        .execute('SP_ANALIZAR_CAMBIO_PLAN_COLABORADOR');

      return {
        INFORMACION_COLABORADOR: result.recordsets[0] || [],
        CAPACITACIONES_MIGRAR: result.recordsets[1] || [],
        CAPACITACIONES_NUEVAS: result.recordsets[2] || []
      };

    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

  async cambiarPlanColaborador(dto: CambiarPlanCapacitacionDto) {
    try {
      const result = await this.entityManager.query(
        `EXEC SP_CAMBIAR_PLAN_COLABORADOR
          @ID_COLABORADOR = @0,
          @NUEVO_DEPARTAMENTO_ID = @1,
          @NUEVO_PUESTO_ID = @2,
          @IDS_DOCUMENTOS_MIGRAR = @3,
          @USUARIO = @4`,
        [
          dto.ID_COLABORADOR,
          dto.NUEVO_DEPARTAMENTO_ID,
          dto.NUEVO_PUESTO_ID,
          dto.IDS_DOCUMENTOS_MIGRAR.join(''),
          dto.USUARIO
        ]
      );

      return result[0] || {};
    } catch (error) {
      this.databaseErrorService.handle(error);
    }
  }

}
