import { IsString, IsInt } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsInt()
  classId: number;
}