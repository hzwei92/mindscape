import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';
import { VotesResolver } from './votes.resolver';
import { UsersModule } from 'src/users/users.module';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArrowsModule),
    TransfersModule,
    PubSubModule,
  ],
  providers: [VotesService, VotesResolver],
  exports: [VotesService],
})
export class VotesModule {}
