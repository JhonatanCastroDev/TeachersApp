import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Student } from './../students/entities/student.entity';
import { Period } from './../periods/entities/period.entity';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
  ) {}

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const { value, percentage, studentId, periodId } = createGradeDto;

    // Verificar si el estudiante existe.
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    // Verificar si el período existe.
    const period = await this.periodRepository.findOne({
      where: { id: periodId },
    });
    if (!period) {
      throw new NotFoundException('Período no encontrado.');
    }

    // Crear y guardar la calificación.
    const grade = this.gradeRepository.create({
      value,
      percentage,
      student,
      period,
    });

    return this.gradeRepository.save(grade);
  }

  async findAll(studentId?: number, periodId?: number): Promise<Grade[]> {
    // Filtrar por estudiante y/o período si se proporcionan.
    const where: any = {};
    if (studentId) where.student = { id: studentId };
    if (periodId) where.period = { id: periodId };

    return this.gradeRepository.find({
      where,
      relations: ['student', 'period'],
    });
  }

  async findOne(id: number): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({
      where: { id },
      relations: ['student', 'period'],
    });
    if (!grade) {
      throw new NotFoundException('Calificación no encontrada.');
    }
    return grade;
  }

  async update(id: number, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({ where: { id } });
    if (!grade) {
      throw new NotFoundException('Calificación no encontrada.');
    }

    // Actualizar campos proporcionados.
    if (updateGradeDto.value) grade.value = updateGradeDto.value;
    if (updateGradeDto.percentage) grade.percentage = updateGradeDto.percentage;
    if (updateGradeDto.studentId) {
      const student = await this.studentRepository.findOne({
        where: { id: updateGradeDto.studentId },
      });
      if (!student) {
        throw new NotFoundException('Estudiante no encontrado.');
      }
      grade.student = student;
    }
    if (updateGradeDto.periodId) {
      const period = await this.periodRepository.findOne({
        where: { id: updateGradeDto.periodId },
      });
      if (!period) {
        throw new NotFoundException('Período no encontrado.');
      }
      grade.period = period;
    }

    return this.gradeRepository.save(grade);
  }

  async remove(id: number): Promise<{ message: string }> {
    const grade = await this.gradeRepository.findOne({ where: { id } });
    if (!grade) {
      throw new NotFoundException('Calificación no encontrada.');
    }

    await this.gradeRepository.delete(id);
    return { message: 'Calificación eliminada correctamente.' };
  }
}