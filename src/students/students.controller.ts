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
    return this.studentsService.findAll(classId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: number) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: number) {
    return this.studentsService.remove(id);
  }
}