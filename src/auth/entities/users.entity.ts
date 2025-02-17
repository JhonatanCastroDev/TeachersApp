import { Exclude } from 'class-transformer';
import { Grade } from 'src/grades/entities/grade.entity';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    select: false
  })
  password: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Grade, (grade) => grade.teacher)
  grades: Grade[];

  @BeforeInsert()
  checkFieldsBeforeInsert(){
      this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate(){
      this.email = this.email.toLowerCase().trim();
  }
}