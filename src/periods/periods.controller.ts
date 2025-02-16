import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) 
  async create(@Body() createPeriodDto: CreatePeriodDto) {
    return this.periodsService.create(createPeriodDto);
  }

  @Get()
  async findAll() {
    return this.periodsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.periodsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt')) 
  async update(
    @Param('id') id: number,
    @Body() updatePeriodDto: UpdatePeriodDto,
  ) {
    return this.periodsService.update(id, updatePeriodDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: number) {
    return this.periodsService.remove(id);
  }
}