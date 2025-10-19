import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePlanCapacitacionDto } from './dto/create-plan-capacitacion.dto';
import { UpdatePlanCapacitacionDto } from './dto/update-plan-capacitacion.dto';
import { EntityManager, Repository } from 'typeorm';
import { PlanCapacitacion } from './entities/plan-capacitacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Injectable()
export class PlanCapacitacionService {

  constructor(@InjectRepository(PlanCapacitacion)
    private planCapacitacionRepository: Repository<PlanCapacitacion>,
    private readonly entityManager: EntityManager,
    private readonly databaseErrorService: DatabaseErrorService
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
            ESTADO = @5
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
      return await this.planCapacitacionRepository.find({
        relations: {
          DEPARTAMENTO: true,
          PLANES_PUESTOS: {
            PUESTO: true
          },
          DOCUMENTOS_PLANES: {
            DOCUMENTO: true
          }
        }
      });

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
            ESTADO = @6
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
        
/*         if (syncPlanResult && syncPlanResult[0].Success === 0) {
          const resultObject = syncPlanResult[0];
          const errorMessage = resultObject.Message as string; 
          throw new Error(errorMessage); 
        } */

        const documentosString = this.getIdsString(ID_DOCUMENTOS || []);
        await manager.query(
            `EXEC sp_PLAN_PUESTO_SINCRONIZAR
              @ID_PLAN = @0,
              @PUESTO_IDS_STRING = @1`,
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
}
