import { IsNumber, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateGradeDto {
  @IsNumber()
  @Min(10)
  @Max(100)
  value: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional() 
  percentage?: number; 

  @IsString()
  studentId: string; 

  @IsInt()
  periodId: number; 
}