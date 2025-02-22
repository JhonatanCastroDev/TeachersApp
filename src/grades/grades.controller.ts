import { Controller, Post, Body, UseGuards, Request, Put, Param, Get, ParseIntPipe, Query, Res } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateStudentGradeDto } from './dto/update-student-grade.dto';
import { Response } from 'express';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createGradeDto: CreateGradeDto, @Request() req) {
    return this.gradesService.create(createGradeDto, req.user.id);
  }

  @Put(':gradeId/value')
  @UseGuards(AuthGuard('jwt'))
  async updateStudentGrade(
    @Param('gradeId') gradeId: number,
    @Body() updateDto: UpdateStudentGradeDto,
  ) {
    return this.gradesService.updateStudentGrade(gradeId, updateDto);
  }

    @Get('class/:classId')
    @UseGuards(AuthGuard('jwt')) 
    async getStudentsWithAttendances(
      @Param('classId', ParseIntPipe) classId:number
    ) {
      return this.gradesService.getStudentsWithGrades(classId);
    }

    @Get('export/class/:classId')
    @UseGuards(AuthGuard('jwt'))
    async exportGradesReport(
      @Param('classId', ParseIntPipe) classId: number,
      @Res() res: Response,
      @Query('periodId', new ParseIntPipe({optional: true})) periodId?: number,
    ) {
      const { buffer, filename } = await this.gradesService.generateGradesReport(
        classId,
        periodId
      );
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.end(buffer);
    }
}