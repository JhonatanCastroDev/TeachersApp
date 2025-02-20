// File: src/grades/entities/student-grade.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Grade } from './grade.entity';
import { Student } from '../../students/entities/student.entity';

@Entity()
export class StudentGrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  value: number;

  @ManyToOne(() => Grade, (grade) => grade.studentGrades)
  grade: Grade;

  @ManyToOne(() => Student, (student) => student.grades)
  student: Student;

  @CreateDateColumn({select: false})
  created_at: Date;

  @UpdateDateColumn({select: false})
  updated_at: Date;
}