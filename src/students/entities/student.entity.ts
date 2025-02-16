import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Class } from '../../classes/entities/class.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.students)
  class: Class; // Relación muchos a uno con la entidad Class.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}