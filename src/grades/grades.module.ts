import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from 'src/students/entities/student.entity';
import { Period } from 'src/periods/entities/period.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Student, Period])],
  controllers: [GradesController],
  providers: [GradesService],
})
export class GradesModule {}
