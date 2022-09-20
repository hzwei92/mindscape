import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersResolver } from './transfers.resolver';

@Module({
  providers: [TransfersService, TransfersResolver]
})
export class TransfersModule {}
