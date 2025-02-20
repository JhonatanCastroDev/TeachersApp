import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { StudentGrade } from 'src/grades/entities/student-grade.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.students)
  class: Class;

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => StudentGrade, (studentGrade) => studentGrade.student)
  grades: StudentGrade[];

  @CreateDateColumn({select: false})
  created_at: Date;

  @UpdateDateColumn({select: false})
  updated_at: Date;
}