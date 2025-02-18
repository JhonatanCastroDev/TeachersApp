import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStatus, CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Student } from '../students/entities/student.entity';
import { Class } from '../classes/entities/class.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async createAttendanceForClass(createAttendanceDto: CreateAttendanceDto): Promise<Attendance[]> {
    const { date, classId } = createAttendanceDto;

    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['students'], // Cargar la lista de estudiantes de la clase.
    });
    if (!classEntity) {
      throw new NotFoundException('Clase no encontrada.');
    }

    // Crear asistencias para todos los estudiantes de la clase.
    const attendances = await Promise.all(
      classEntity.students.map(async (student) => {
        const attendance = this.attendanceRepository.create({
          date: new Date(date),
          class: classEntity,
          student,
          status: AttendanceStatus.PRESENT, // Valor predeterminado.
        });
        return this.attendanceRepository.save(attendance);
      }),
    );

    return attendances;
  }

  async updateAttendanceStatus(
    attendanceId: number,
    status: AttendanceStatus,
  ): Promise<Attendance> {
    if (!Object.values(AttendanceStatus).includes(status)) {
      throw new BadRequestException('Estado de asistencia no válido.');
    }

    const attendance = await this.attendanceRepository.findOne({ where: { id: attendanceId } });
    if (!attendance) {
      throw new NotFoundException('Asistencia no encontrada.');
    }

    attendance.status = status;
    return this.attendanceRepository.save(attendance);
  }

  async findByClassAndDate(classId: number, date: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { class: { id: classId }, date: new Date(date) },
      relations: ['student'],
    });
  }
}