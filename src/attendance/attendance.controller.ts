import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) // Proteger la ruta con JWT.
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get('student/:id')
  async findByStudent(@Param('id', ParseUUIDPipe) studentId: string) {
    return this.attendanceService.findByStudent(studentId);
  }

  @Get('class/:id')
  async findByClass(
    @Param('id', ParseIntPipe) classId: number,
    @Query('date') date: string,
  ) {
    return this.attendanceService.findByClass(classId, date);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt')) // Proteger la ruta con JWT.
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt')) // Proteger la ruta con JWT.
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}