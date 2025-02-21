import { Module } from '@nestjs/common';
import { ParseDatePipe } from './pipes/parse-date-pipe/parse-date.pipe';

@Module({
  controllers: [],
  providers: [ParseDatePipe],
  exports: [ParseDatePipe],
})
export class CommonModule {}
