import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { Student } from 'src/students/entities/student.entity';
import { Period } from 'src/periods/entities/period.entity';
import { Class } from 'src/classes/entities/class.entity';
import { User } from 'src/auth/entities/users.entity';
import { StudentGrade } from './entities/student-grade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grade, Student, Period, Class, User, StudentGrade])],
  controllers: [GradesController],
  providers: [GradesService],
})
export class GradesModule {}
