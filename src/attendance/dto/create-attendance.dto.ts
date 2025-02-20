import { IsDateString, IsString, IsUUID, IsEnum, IsInt } from 'class-validator';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  EXCUSED = 'excused',
}

export class CreateAttendanceDto {
  @IsDateString()
  date: string;

  @IsInt()
  classId: number; 
}