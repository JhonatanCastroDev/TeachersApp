import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { Student } from 'src/students/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, Student]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [TypeOrmModule]
})
export class ClassesModule {}
