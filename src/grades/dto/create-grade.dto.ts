import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export enum learningSkill {
  READING = 'reading',
  WRITING = 'writing',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
}

export class CreateGradeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(learningSkill)
  skill: learningSkill;

  @IsInt()
  classId: number;

  @IsInt()
  periodId: number;
}