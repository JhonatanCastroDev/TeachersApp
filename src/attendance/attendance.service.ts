import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Student } from './../students/entities/student.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const { date, status, studentId } = createAttendanceDto;

    // Verificar si el estudiante existe.
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    // Crear y guardar el registro de asistencia.
    const attendance = this.attendanceRepository.create({
      date: new Date(date),
      status,
      student,
    });

    return this.attendanceRepository.save(attendance);
  }

  async findByStudent(studentId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { student: { id: studentId } },
      relations: ['student'],
    });
  }

  async findByClass(classId: number, date: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { student: { class: { id: classId } }, date: new Date(date) },
      relations: ['student'],
    });
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });
    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado.');
    }

    // Actualizar campos proporcionados.
    if (updateAttendanceDto.date) attendance.date = new Date(updateAttendanceDto.date);
    if (updateAttendanceDto.status) attendance.status = updateAttendanceDto.status;

    return this.attendanceRepository.save(attendance);
  }

  async remove(id: number): Promise<{ message: string }> {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });
    if (!attendance) {
      throw new NotFoundException('Registro de asistencia no encontrado.');
    }

    await this.attendanceRepository.delete(id);
    return { message: 'Registro de asistencia eliminado correctamente.' };
  }
}