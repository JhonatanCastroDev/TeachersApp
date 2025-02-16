import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const { name } = createClassDto;

    const classEntity = this.classRepository.create({
      name,
    });

    return this.classRepository.save(classEntity);
  }

  async findAll(): Promise<Class[]> {
    return this.classRepository.find({ relations: ['students'] });
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['students'], // Incluir la lista de estudiantes.
    });
    if (!classEntity) {
      throw new NotFoundException('Clase no encontrada.');
    }
    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const classEntity = await this.classRepository.findOne({ where: { id } });
    if (!classEntity) {
      throw new NotFoundException('Clase no encontrada.');
    }

    // Actualizar campos proporcionados.
    if (updateClassDto.name) classEntity.name = updateClassDto.name;

    return this.classRepository.save(classEntity);
  }

  async remove(id: number): Promise<{ message: string }> {
    const classEntity = await this.classRepository.findOne({ where: { id } });
    if (!classEntity) {
      throw new NotFoundException('Clase no encontrada.');
    }

    await this.classRepository.delete(id);
    return { message: 'Clase eliminada correctamente.' };
  }
}