import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto, learningSkill } from './dto/create-grade.dto';
import { Class } from '../classes/entities/class.entity';
import { Period } from '../periods/entities/period.entity';
import { User } from '../auth/entities/users.entity';
import { StudentGrade } from './entities/student-grade.entity';
import { Student } from '../students/entities/student.entity';
import { UpdateStudentGradeDto } from './dto/update-student-grade.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentGrade)
    private readonly studentGradeRepository: Repository<StudentGrade>,
  ) {}

  async create(createGradeDto: CreateGradeDto, teacherId: number): Promise<any> {
    const { name, description, classId, periodId, skill } = createGradeDto;

    const classEntity = await this.classRepository.findOne({ 
      where: { id: classId },
      relations: ['students']
    });
    if (!classEntity) throw new NotFoundException('Class not found');

    const period = await this.periodRepository.findOne({ where: { id: periodId } });
    if (!period) throw new NotFoundException('Period not found');

    const teacher = await this.userRepository.findOne({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException('Teacher not found');

    const grade = await this.gradeRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const newGrade = this.gradeRepository.create({
          name,
          description,
          class: classEntity,
          period,
          teacher,
          skill
        });
        await transactionalEntityManager.save(newGrade);

        const studentGrades = classEntity.students.map(student => {
          return this.studentGradeRepository.create({
            student,
            value: null,
            grade: newGrade
          });
        });

        await transactionalEntityManager.save(StudentGrade, studentGrades);

        return transactionalEntityManager.findOne(Grade, {
          where: { id: newGrade.id },
          relations: ['studentGrades']
        });
        }
        );
  
    return grade;
  }

  async updateStudentGrade(
    gradeId: number,
    updateDto: UpdateStudentGradeDto,
  ): Promise<StudentGrade> {
    const studentGrade = await this.studentGradeRepository.findOne({
      where: { id: gradeId},
    });

    if (!studentGrade) throw new NotFoundException('Grade not found');

    studentGrade.value = updateDto.value;
    return this.studentGradeRepository.save(studentGrade);
  }

  async getStudentsWithGrades(classId: number): Promise<any[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const grades = await this.gradeRepository.find({
      where: { class: { id: classId } },
      relations: ['studentGrades', 'studentGrades.student'],
    });

    return grades
  }

  async generateGradesReport(
    classId: number,
    periodId: number
  ): Promise<{ buffer: Buffer; filename: string }> {
    const classEntity = await this.classRepository.findOne({ 
      where: { id: classId },
      relations: ['students']
    });
    
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    let period: Period;
    if (periodId) {
      period = await this.periodRepository.findOne({ 
        where: { id: periodId },
        relations: ['grades']
      });
      if (!period) throw new NotFoundException('Period not found');
    }
  
    // Obtener todas las notas (filtrar por período si existe)
    const gradesQuery = this.gradeRepository.createQueryBuilder('grade')
      .leftJoinAndSelect('grade.studentGrades', 'studentGrades')
      .leftJoinAndSelect('studentGrades.student', 'student')
      .where('grade.classId = :classId', { classId });
  
    if (periodId) {
      gradesQuery.andWhere('grade.periodId = :periodId', { periodId });
    }
  
    const grades = await gradesQuery.getMany();
  
    const skillsMap = new Map<learningSkill, Grade[]>();
    grades.forEach(grade => {
      if (!skillsMap.has(grade.skill)) {
        skillsMap.set(grade.skill, []);
      }
      skillsMap.get(grade.skill).push(grade);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Grades');

    const skillHeaderStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };
    
    const evaluationHeaderStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FF000000' }, size: 10 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    const columns = [
      { header: 'NAMES', key: 'name', width: 35 }
    ];
    

    Array.from(skillsMap.keys()).forEach(skill => {
      const gradesForSkill = skillsMap.get(skill);
      gradesForSkill.forEach(grade => {
        columns.push({ 
          header: `${skill.toUpperCase()}\n${grade.name}`, 
          key: `${grade.id}_${skill}`,
          width: 15 
        });
      });
    });

    columns.push({ header: 'AVERAGE', key: 'average', width: 15 });

    worksheet.columns = columns;

    worksheet.mergeCells('A1:A2');
    worksheet.mergeCells(`${String.fromCharCode(65 + worksheet.columnCount - 1)}1:${String.fromCharCode(65 + worksheet.columnCount - 1)}2`); // Fusionar celda de PROMEDIO

    const nameHeaderCell = worksheet.getCell('A1');
    nameHeaderCell.style = skillHeaderStyle;
    nameHeaderCell.alignment = { 
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };

    const averageHeaderCell = worksheet.getCell(`${String.fromCharCode(65 + worksheet.columnCount - 1)}1`);
    averageHeaderCell.style = skillHeaderStyle;
    averageHeaderCell.alignment = { 
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };

    worksheet.getRow(2).eachCell((cell, colNumber) => {
      if (colNumber !== 1 && colNumber !== worksheet.columnCount) {
        cell.style = evaluationHeaderStyle;
      }
    });

    let colIndex = 1;
    Array.from(skillsMap.entries()).forEach(([skill, grades], skillIndex) => {
      if (grades.length > 0) {
        // Fusion cells for skill name
        worksheet.mergeCells(1, colIndex + 1, 1, colIndex + grades.length);
        const skillCell = worksheet.getCell(1, colIndex + 1);
        skillCell.value = skill.toUpperCase();
        skillCell.style = skillHeaderStyle;
    
        // Add names for each grade
        grades.forEach((grade, gradeIndex) => {
          const evaluationCell = worksheet.getCell(2, colIndex + gradeIndex + 1);
          evaluationCell.value = grade.name;
          evaluationCell.style = evaluationHeaderStyle;
        });
    
        colIndex += grades.length;
      }
    });

    for (const student of classEntity.students) {
      const row: any = { name: student.name };
      let total = 0;
      let count = 0;

      Array.from(skillsMap.entries()).forEach(([skill, grades]) => {
        grades.forEach(grade => {
          const studentGrade = grade.studentGrades.find(sg => sg.student.id === student.id);
          const value = studentGrade?.value ?? '-';
          row[`${grade.id}_${skill}`] = value;
          
          if (typeof value === 'number') {
            total += value;
            count++;
          }
        });
      });

      row.average = count > 0 ? (total / count).toFixed(2) : '-';
      worksheet.addRow(row);
    }

    worksheet.getRow(2).eachCell(cell => {
      cell.style = skillHeaderStyle;
    });
    worksheet.getCell(1, worksheet.columnCount).style = evaluationHeaderStyle;

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `calificaciones-clase-${classId}${
      periodId ? `-periodo-${periodId}` : ''
    }.xlsx`;

    return { buffer: buffer as Buffer, filename };
  }
}