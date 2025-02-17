import { IsString, IsInt, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  defaultGrade?: number = 10;

  @IsInt()
  classId: number;

  @IsInt()
  periodId: number;
}