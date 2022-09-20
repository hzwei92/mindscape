import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arrow } from './arrow.entity';
import { ArrowsService } from './arrows.service';
import { ArrowsResolver } from './arrows.resolver';
import { SubsModule } from 'src/subs/subs.module';
import { SearchModule } from 'src/search/search.module';
import { RolesModule } from 'src/roles/roles.module';
import { UsersModule } from 'src/users/users.module';
import { VotesModule } from 'src/votes/votes.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { TwigsModule } from 'src/twigs/twigs.module';
import { SheafsModule } from 'src/sheafs/sheafs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Arrow]),
    forwardRef(() => UsersModule),
    forwardRef(() => TwigsModule),
    forwardRef(() => RolesModule),
    forwardRef(() => SheafsModule),
    VotesModule,
    SubsModule,
    PubSubModule,
    SearchModule,
  ],
  providers: [ArrowsService, ArrowsResolver],
  exports: [ArrowsService],
})
export class ArrowsModule {}
