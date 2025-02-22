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
}