import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { AttendanceStatus } from '../dto/create-attendance.dto';
import { Class } from '../../classes/entities/class.entity';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date; // Fecha en la que se toma la asistencia.

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @ManyToOne(() => Student, (student) => student.attendances)
  student: Student;

  @ManyToOne(() => Class, (classEntity) => classEntity.attendances)
  class: Class;

  @CreateDateColumn({select: false})
  created_at: Date;

  @UpdateDateColumn({select: false})
  updated_at: Date;
}