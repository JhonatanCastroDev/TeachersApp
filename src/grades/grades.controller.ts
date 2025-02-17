import { Controller, Post, Body, UseGuards, Request, Put, Param } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateStudentGradeDto } from './dto/update-student-grade.dto';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createGradeDto: CreateGradeDto, @Request() req) {
    return this.gradesService.create(createGradeDto, req.user.id);
  }

  @Put(':gradeId/students/:studentId')
  @UseGuards(AuthGuard('jwt'))
  async updateStudentGrade(
    @Param('gradeId') gradeId: number,
    @Param('studentId') studentId: string,
    @Body() updateDto: UpdateStudentGradeDto,
  ) {
    return this.gradesService.updateStudentGrade(gradeId, studentId, updateDto);
  }
}