import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Grade } from 'src/grades/entities/grade.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.students)
  class: Class; // Relación muchos a uno con la entidad Class.

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}