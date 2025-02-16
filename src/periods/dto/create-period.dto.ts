import { IsString, IsDateString } from 'class-validator';

export class CreatePeriodDto {
  @IsString()
  name: string; // Nombre del período.

  @IsDateString()
  startDate: string; // Fecha de inicio en formato ISO (ejemplo: "2023-10-01").

  @IsDateString()
  endDate: string; // Fecha de fin en formato ISO (ejemplo: "2023-12-31").
}