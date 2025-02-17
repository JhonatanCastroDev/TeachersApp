import { IsNumber, Min, Max } from 'class-validator';

export class UpdateStudentGradeDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;
}