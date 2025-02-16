import { Module } from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { PeriodsController } from './periods.controller';
import { Period } from './entities/period.entity';
import { Grade } from 'src/grades/entities/grade.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Period, Grade])],
  controllers: [PeriodsController],
  providers: [PeriodsService],
})
export class PeriodsModule {}
