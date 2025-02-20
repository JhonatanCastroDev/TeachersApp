import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GradesModule } from './grades/grades.module';
import { ClassesModule } from './classes/classes.module';
import { PeriodsModule } from './periods/periods.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true
    }),
    AuthModule,
    StudentsModule,
    AttendanceModule,
    GradesModule,
    ClassesModule,
    PeriodsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
