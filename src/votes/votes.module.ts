import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';
import { VotesResolver } from './votes.resolver';
import { UsersModule } from 'src/users/users.module';
import { ArrowsService } from 'src/arrows/arrows.service';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Vote]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArrowsModule),
    TransfersModule,
  ],
  providers: [VotesService, VotesResolver],
  exports: [VotesService],
})
export class VotesModule {}
