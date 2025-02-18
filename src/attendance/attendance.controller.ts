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
    @Body('status') status: string, 
  ) {
    if (!Object.values(AttendanceStatus).includes(status as AttendanceStatus)) {
      throw new BadRequestException('Estado de asistencia no válido.');
    }

    const attendanceStatus = status as AttendanceStatus;

    return this.attendanceService.updateAttendanceStatus(id, attendanceStatus);
  }

  @Get('class/:classId')
  @UseGuards(AuthGuard('jwt'))
  async findByClassAndDate(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('date') date: string,
  ) {
    return this.attendanceService.findByClassAndDate(classId, date);
  }
}