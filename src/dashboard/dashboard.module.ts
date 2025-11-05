import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DatabaseErrorService } from 'src/common/database-error.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, DatabaseErrorService],
})
export class DashboardModule {}
