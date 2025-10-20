import { Module } from '@nestjs/common';
import { DocumentoPlanService } from './documento-plan.service';
import { DocumentoPlanController } from './documento-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoPlan } from './entities/documento-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoPlan])],
  controllers: [DocumentoPlanController],
  providers: [DocumentoPlanService],
})
export class DocumentoPlanModule {}
