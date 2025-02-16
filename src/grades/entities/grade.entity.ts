import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { Period } from '../../periods/entities/period.entity';

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: number;

  @Column({ nullable: true }) 
  percentage?: number; 

  @ManyToOne(() => Student, (student) => student.grades)
  student: Student;

  @ManyToOne(() => Period, (period) => period.grades)
  period: Period;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}