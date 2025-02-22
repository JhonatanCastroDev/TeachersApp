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
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateMultipleStudentsDto } from './dto/create-multiple.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Post('multiple')
  @UseGuards(AuthGuard('jwt'))
  async createMultiple(@Body() createMultipleStudentsDto: CreateMultipleStudentsDto) {
    return this.studentsService.createMultiple(createMultipleStudentsDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Query('classId') classId?: number) {
    const students = await this.studentsService.findAll(classId);

    return students.map((student) => ({
      id: student.id,
      name: student.name,
      class: {
        id: student.class.id,
        name: student.class.name,
      },
      attendances: student.attendances.map((attendance) => ({
        date: attendance.date,
        status: attendance.status,
      })),
      grades: student.grades.map((grade) => ({
        id: grade.id,
        value: grade.value,
        evaluation: {
          id: grade.grade.id,
          name: grade.grade.name,
          description: grade.grade.description,
        },
      })),
    }));
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.remove(id);
  }
}