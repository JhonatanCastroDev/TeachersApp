import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
  ParseIntPipe,
  Query,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus, CreateAttendanceDto } from './dto/create-attendance.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Response } from 'express';
import { ParseDatePipe } from 'src/common/pipes/parse-date-pipe/parse-date.pipe';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService
  ) {}

  @Post('class')
  @UseGuards(AuthGuard('jwt'))
  async createAttendanceForClass(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.createAttendanceForClass(createAttendanceDto);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateAttendanceStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateAttendanceDto: UpdateAttendanceDto, 
  ) {
    if (!Object.values(AttendanceStatus).includes(UpdateAttendanceDto.status as AttendanceStatus)) {
      throw new BadRequestException('Attendance state not valid');
    }

    const attendanceStatus = UpdateAttendanceDto.status as AttendanceStatus;

    return this.attendanceService.updateAttendanceStatus(id, attendanceStatus);
  }

  @Get('class/:classId')
  @UseGuards(AuthGuard('jwt')) 
  async getStudentsWithAttendances(
    @Param('classId', ParseIntPipe) classId:number
  ) {
    return this.attendanceService.getStudentsWithAttendances(classId);
  }

  @Get('export/class/:classId')
  @UseGuards(AuthGuard('jwt'))
  async exportAttendanceReport(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('startDate', ParseDatePipe) startDate: string,
    @Query('endDate', ParseDatePipe) endDate: string,
    @Res() res: Response
  ) {
    const { buffer, filename } = await this.attendanceService.generateAttendanceReport(
      classId,
      startDate,
      endDate
    );
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.end(buffer);
  }
}