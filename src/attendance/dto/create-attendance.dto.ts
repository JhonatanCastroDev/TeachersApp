import { IsDateString, IsString, IsInt, IsUUID, IsEnum } from 'class-validator';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  EXCUSED = 'excused',
}

export class CreateAttendanceDto {
  @IsDateString()
  date: string; // Fecha en formato ISO (ejemplo: "2023-10-01").

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus; // Estado de la asistencia: "present", "absent", "excused".

  @IsString()
  @IsUUID()
  studentId: string; // ID del estudiante.
}