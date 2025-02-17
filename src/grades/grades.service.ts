import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto } from './dto/create-grade.dto';
import { Class } from '../classes/entities/class.entity';
import { Period } from '../periods/entities/period.entity';
import { User } from '../auth/entities/users.entity';
import { StudentGrade } from './entities/student-grade.entity';
import { Student } from '../students/entities/student.entity';
import { UpdateStudentGradeDto } from './dto/update-student-grade.dto';

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

  async create(createGradeDto: CreateGradeDto, teacherId: number): Promise<Grade> {
    const { name, description, defaultGrade, classId, periodId } = createGradeDto;

    const classEntity = await this.classRepository.findOne({ 
      where: { id: classId },
      relations: ['students']
    });
    if (!classEntity) throw new NotFoundException('Clase no encontrada');

    const period = await this.periodRepository.findOne({ where: { id: periodId } });
    if (!period) throw new NotFoundException('Período no encontrado');

    const teacher = await this.userRepository.findOne({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException('Profesor no encontrado');

    // Crear la evaluación principal
    const grade = this.gradeRepository.create({
      name,
      description,
      defaultGrade,
      class: classEntity,
      period,
      teacher,
    });

    // Crear notas para todos los estudiantes
    grade.studentGrades = await Promise.all(
      classEntity.students.map(async (student) => {
        return this.studentGradeRepository.create({
          student,
          value: defaultGrade,
        });
      })
    );

    return this.gradeRepository.save(grade);
  }

  async updateStudentGrade(
    gradeId: number,
    studentId: string,
    updateDto: UpdateStudentGradeDto,
  ): Promise<StudentGrade> {
    const studentGrade = await this.studentGradeRepository.findOne({
      where: {
        grade: { id: gradeId },
        student: { id: studentId },
      },
    });

    if (!studentGrade) throw new NotFoundException('Calificación no encontrada');

    studentGrade.value = updateDto.value;
    return this.studentGradeRepository.save(studentGrade);
  }
}