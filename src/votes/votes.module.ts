import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './vote.entity';
import { VotesService } from './votes.service';
import { VotesResolver } from './votes.resolver';
import { UsersModule } from 'src/users/users.module';
import { ArrowsService } from 'src/arrows/arrows.service';
import { ArrowsModule } from 'src/arrows/arrows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArrowsModule),
  ],
  providers: [VotesService, VotesResolver],
  exports: [VotesService],
})
export class VotesModule {}
