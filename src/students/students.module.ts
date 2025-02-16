import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ClassesModule } from 'src/classes/classes.module';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [
    TypeOrmModule.forFeature([Student]),
    AuthModule,
    ClassesModule
  ]
})
export class StudentsModule {}
