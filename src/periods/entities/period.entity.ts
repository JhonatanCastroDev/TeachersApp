import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Grade } from '../../grades/entities/grade.entity';

@Entity()
export class Period {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; 

  @Column()
  startDate: Date; 

  @Column()
  endDate: Date; 

  @OneToMany(() => Grade, (grade) => grade.period)
  grades: Grade[]; 

  @CreateDateColumn({select: false})
  created_at: Date;

  @UpdateDateColumn({select: false})
  updated_at: Date;
}