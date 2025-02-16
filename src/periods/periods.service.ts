import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period } from './entities/period.entity';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
  ) {}

  async create(createPeriodDto: CreatePeriodDto): Promise<Period> {
    const { name, startDate, endDate } = createPeriodDto;

    // Crear y guardar el período.
    const period = this.periodRepository.create({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return this.periodRepository.save(period);
  }

  async findAll(): Promise<Period[]> {
    return this.periodRepository.find({ relations: ['grades'] });
  }

  async findOne(id: number): Promise<Period> {
    const period = await this.periodRepository.findOne({
      where: { id },
      relations: ['grades'],
    });
    if (!period) {
      throw new NotFoundException('Período no encontrado.');
    }
    return period;
  }

  async update(id: number, updatePeriodDto: UpdatePeriodDto): Promise<Period> {
    const period = await this.periodRepository.findOne({ where: { id } });
    if (!period) {
      throw new NotFoundException('Período no encontrado.');
    }

    // Actualizar campos proporcionados.
    if (updatePeriodDto.name) period.name = updatePeriodDto.name;
    if (updatePeriodDto.startDate) period.startDate = new Date(updatePeriodDto.startDate);
    if (updatePeriodDto.endDate) period.endDate = new Date(updatePeriodDto.endDate);

    return this.periodRepository.save(period);
  }

  async remove(id: number): Promise<{ message: string }> {
    const period = await this.periodRepository.findOne({ where: { id } });
    if (!period) {
      throw new NotFoundException('Período no encontrado.');
    }

    await this.periodRepository.delete(id);
    return { message: 'Período eliminado correctamente.' };
  }
}