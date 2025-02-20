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
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceStatus, CreateAttendanceDto } from './dto/create-attendance.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

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
}