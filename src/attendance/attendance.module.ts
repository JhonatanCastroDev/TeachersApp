import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { Student } from '../students/entities/student.entity';
import { Class } from 'src/classes/entities/class.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Student, Class]),
    CommonModule,
],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}