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

    const classEntity = await this.findClass(classId)
    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

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

      const classEntity = await this.findClass(classId)
      if (!classEntity) {
        throw new NotFoundException(`Class not found for student: ${name}.`);
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
    const relations = ['class','attendances', 'grades', 'grades.grade'];
    const validClass = await this.findClass(classId)

    if (!validClass ) throw new NotFoundException(`${classId} is not a valid classId`)

    return this.studentRepository.find({ relations });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['class'],
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (updateStudentDto.name) student.name = updateStudentDto.name;
    if (updateStudentDto.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: updateStudentDto.classId },
      });
      if (!classEntity) {
        throw new NotFoundException('Class not found');
      }
      student.class = classEntity;
    }

    return this.studentRepository.save(student);
  }

  async remove(id: string): Promise<{ message: string }> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.studentRepository.delete(id);
    return { message: 'Student deleted correctly' };
  }

  async findClass (classID : number){
    const validClass = await this.classRepository.findOne({
      where: {id:classID}
    })

    if(!validClass) throw new NotFoundException('class not found')

    return validClass
  }
}