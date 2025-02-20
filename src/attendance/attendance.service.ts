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

  async createAttendanceForClass(createAttendanceDto: CreateAttendanceDto) {
    const { date, classId } = createAttendanceDto;

    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['students'],
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const attendances = await Promise.all(
      classEntity.students.map(async (student) => {
        const attendance = this.attendanceRepository.create({
          date: new Date(date),
          student,
          status: AttendanceStatus.PRESENT,
          class: classEntity
        });
        return this.attendanceRepository.save(attendance);
      }),
    );

    return attendances.map((attendance) => {
      delete attendance.class;
      delete attendance.created_at;
      delete attendance.updated_at;
      return attendance;
    })
  }

  async updateAttendanceStatus(
    attendanceId: number,
    status: AttendanceStatus,
  ): Promise<Attendance> {
    if (!Object.values(AttendanceStatus).includes(status)) {
      throw new BadRequestException('Attendance status not found');
    }

    const attendance = await this.attendanceRepository.findOne({ where: { id: attendanceId } });
    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    attendance.status = status;
    return this.attendanceRepository.save(attendance);
  }

  async getStudentsWithAttendances(classId: number): Promise<any[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const students = await this.studentRepository.find({
      where: { class: { id: classId } },
      relations: ['attendances'],
    });

    return students
  }
}