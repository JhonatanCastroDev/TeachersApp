// File: src/grades/entities/student-grade.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Grade } from './grade.entity';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class StudentGrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  value: number; // Nota individual del estudiante

  @ManyToOne(() => Grade, (grade) => grade.studentGrades)
  grade: Grade;

  @ManyToOne(() => Student, (student) => student.grades)
  student: Student;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}