import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStatus, CreateAttendanceDto } from './dto/create-attendance.dto';
import { Student } from '../students/entities/student.entity';
import { Class } from '../classes/entities/class.entity';
import * as ExcelJS from 'exceljs';

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

    const classEntity = await this.checkIfClassExists(classId)
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
    const classEntity = await this.checkIfClassExists(classId)
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const students = await this.studentRepository.find({
      where: { class: { id: classId } },
      relations: ['attendances'],
    });

    return students
  }

  async generateAttendanceReport(
    classId: number,
    startDate?: string,
    endDate?: string
  ): Promise<{ buffer: Buffer; filename: string }> {
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('start date cannot be greater than endDate');
    }
  
    if (startDate && parsedStartDate > new Date()) {
      throw new BadRequestException('start date cannot be in the future');
    }
  
    if (endDate && parsedEndDate > new Date()) {
      throw new BadRequestException('end date cannot be in the future');
    }

    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    throw new BadRequestException('The start date must be before the end date');
    }

    const whereClause: any = { class: { id: classId } };
  
    if (parsedStartDate || parsedEndDate) {
    whereClause.date = Between(
      parsedStartDate || new Date(0), 
      parsedEndDate || new Date()      
    );
  }
    
    const classEntity = await this.checkIfClassExists(classId)
    
    const attendances = await this.attendanceRepository.find({
      where: whereClause ,
      relations: ['student'],
      order: { date: 'ASC' }
    });
  
    const studentsMap = new Map<string, {
      name: string;
      absences: number;
      attendances: { [date: string]: string };
    }>();
  
    const datesSet = new Set<string>();
    
  
    attendances.forEach(attendance => {
      const dateStr = attendance.date.toISOString().split('T')[0];
      datesSet.add(dateStr);
      
      const studentId = attendance.student.id;
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          name: attendance.student.name,
          absences: 0,
          attendances: {}
        });
      }
      
      const student = studentsMap.get(studentId);
      student.attendances[dateStr] = attendance.status;
      
      if (attendance.status === AttendanceStatus.ABSENT) {
        student.absences++;
      }
    });
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendances');
  
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
  
    worksheet.columns = [
      { header: 'NAMES', key: 'name', width: 30 },
      { header: 'ABSENCES', key: 'absences', width: 15 },
      ...Array.from(datesSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(date => ({
        header: date,
        key: date,
        width: 15
      }))
    ];
  
    worksheet.getRow(1).eachCell(cell => {
      cell.style = headerStyle;
    });
  
    studentsMap.forEach(student => {
      const row: any = {
        name: student.name,
        absences: student.absences
      };
  
      Array.from(datesSet).sort().forEach(date => {
        row[date] = this.translateStatus(student.attendances[date] || 'Not registered');
      });
  
      worksheet.addRow(row);
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `class-attendance-${classId}${
      startDate ? `_from-${startDate}` : ''
    }${endDate ? `_until-${endDate}` : ''}.xlsx`;
    
    return {
      buffer: buffer as Buffer,
      filename: filename
    };
  }
  
  private translateStatus(status: string): string {
    const statusMap = {
      [AttendanceStatus.PRESENT]: '✓',
      [AttendanceStatus.ABSENT]: '✗',
      [AttendanceStatus.EXCUSED]: 'J',
      'Not registered': '-'
    };
    return statusMap[status] || status;
  }

  private async checkIfClassExists(classId: number) {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['students'],
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }
    return classEntity;
  }
}