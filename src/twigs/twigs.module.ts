import { forwardRef, Module } from '@nestjs/common';
import { TwigsService } from './twigs.service';
import { TwigsResolver } from './twigs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Twig } from './twig.entity';
import { UsersModule } from 'src/users/users.module';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { VotesModule } from 'src/votes/votes.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { RolesModule } from 'src/roles/roles.module';
import { SheafsModule } from 'src/sheafs/sheafs.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { AlertsModule } from 'src/alerts/alerts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Twig]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArrowsModule),
    forwardRef(() => RolesModule),
    TransfersModule,
    SheafsModule,
    VotesModule,
    AlertsModule,
    PubSubModule,
  ],
  providers: [TwigsService, TwigsResolver],
  exports: [TwigsService],
})
export class TwigsModule {}
