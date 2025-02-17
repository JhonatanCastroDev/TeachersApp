import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Grade } from 'src/grades/entities/grade.entity';

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}