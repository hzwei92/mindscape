import { forwardRef, Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersResolver } from './transfers.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './transfer.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer]),
    forwardRef(() => UsersModule),
  ],
  providers: [TransfersService, TransfersResolver],
  exports: [TransfersService],
})
export class TransfersModule {}
