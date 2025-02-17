// File: src/grades/entities/grade.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Period } from '../../periods/entities/period.entity';
import { StudentGrade } from './student-grade.entity';
import { User } from '../../auth/entities/users.entity';

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Nombre de la evaluación

  @Column({ nullable: true })
  description?: string; // Descripción opcional

  @Column({ default: 10 }) // Valor predeterminado para todas las notas
  defaultGrade: number;

  @ManyToOne(() => Class, (classEntity) => classEntity.grades)
  class: Class;

  @ManyToOne(() => Period, (period) => period.grades)
  period: Period;

  @ManyToOne(() => User, (user) => user.grades)
  teacher: User;

  @OneToMany(() => StudentGrade, (studentGrade) => studentGrade.grade, {
    cascade: true,
  })
  studentGrades: StudentGrade[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}