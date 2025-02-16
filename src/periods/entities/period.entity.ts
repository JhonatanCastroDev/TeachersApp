import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Grade } from '../../grades/entities/grade.entity';

@Entity()
export class Period {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Nombre del período (ejemplo: "Primer Trimestre").

  @Column()
  startDate: Date; // Fecha de inicio del período.

  @Column()
  endDate: Date; // Fecha de fin del período.

  @OneToMany(() => Grade, (grade) => grade.period)
  grades: Grade[]; // Relación uno a muchos con la entidad Grade.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}