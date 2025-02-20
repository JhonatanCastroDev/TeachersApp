import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Grade } from 'src/grades/entities/grade.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Student, (student) => student.class)
  students: Student[];

  @OneToMany(() => Grade, (grade) => grade.class) // Nueva relación con Grade
  grades: Grade[];

  @OneToMany(() => Attendance, (attendance) => attendance.class) // Relación con Attendance
  attendances: Attendance[];

  @CreateDateColumn({select: false})
  created_at: Date;

  @UpdateDateColumn({select: false})
  updated_at: Date;

  @DeleteDateColumn({select: false})
  deleted_at: Date;
}