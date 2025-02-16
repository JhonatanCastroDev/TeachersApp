import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateMultipleStudentsDto } from './dto/create-multiple.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Class } from './../classes/entities/class.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const { name, classId } = createStudentDto;

    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });
    if (!classEntity) {
      throw new NotFoundException('Clase no encontrada.');
    }

    // Crear y guardar el estudiante.
    const student = this.studentRepository.create({
      name,
      class: classEntity,
    });

    return this.studentRepository.save(student);
  }

  async createMultiple(createMultipleStudentsDto: CreateMultipleStudentsDto): Promise<Student[]> {
    const { students } = createMultipleStudentsDto;

    const createdStudents: Student[] = [];

    for (const studentDto of students) {
      const { name, classId } = studentDto;

      const classEntity = await this.classRepository.findOne({
        where: { id: classId },
      });
      if (!classEntity) {
        throw new NotFoundException(`Clase no encontrada para el estudiante: ${name}.`);
      }

      const student = this.studentRepository.create({
        name,
        class: classEntity,
      });

      const savedStudent = await this.studentRepository.save(student);
      createdStudents.push(savedStudent);
    }

    return createdStudents;
  }

  async findAll(classId?: number): Promise<Student[]> {
    if (classId) {
      return this.studentRepository.find({
        where: { class: { id: classId } },
        relations: ['class'],
      });
    }

    return this.studentRepository.find({ relations: ['class'] });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['class'],
    });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado.');
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    if (updateStudentDto.name) student.name = updateStudentDto.name;
    if (updateStudentDto.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: updateStudentDto.classId },
      });
      if (!classEntity) {
        throw new NotFoundException('Clase no encontrada.');
      }
      student.class = classEntity;
    }

    return this.studentRepository.save(student);
  }

  async remove(id: number): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado.');
    }

    await this.studentRepository.delete(id);
    return { message: 'Estudiante eliminado correctamente.' };
  }
}