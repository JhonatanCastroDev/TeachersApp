import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';
import { Period } from '../../periods/entities/period.entity';
import { StudentGrade } from './student-grade.entity';
import { User } from '../../auth/entities/users.entity';
import { learningSkill } from '../dto/create-grade.dto';

@Entity()
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; 

  @Column({
    type: 'enum',
    enum: learningSkill,
  })
  skill: learningSkill;

  @Column({ nullable: true })
  description?: string; 

  @ManyToOne(() => Class, (classEntity) => classEntity.grades)
  class: Class;

  @ManyToOne(() => Period, (period) => period.grades)
  period: Period;

  @ManyToOne(() => User, (user) => user.grades)
  teacher: User;

  @OneToMany(() => StudentGrade, (studentGrade) => studentGrade.grade, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  studentGrades: StudentGrade[];

  @CreateDateColumn({select: false})
  created_at: Date;

  @UpdateDateColumn({select: false})
  updated_at: Date;
}