import { IsString, IsInt, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  classId: number;

  @IsInt()
  periodId: number;
}