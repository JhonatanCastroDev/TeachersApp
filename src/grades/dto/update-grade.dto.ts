import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';


export class UpdateGradeDto {
    @IsNumber()
    @Min(10)
    @Max(100)
    @IsOptional()
    value?: number;
  
    @IsNumber()
    @Min(0)
    @Max(100)
    @IsOptional()
    percentage?: number;
  
    @IsInt()
    @IsOptional()
    studentId?: string;
  
    @IsInt()
    @IsOptional()
    periodId?: number;
  }
