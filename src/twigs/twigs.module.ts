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
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Twig]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArrowsModule),
    forwardRef(() => RolesModule),
    TransfersModule,
    SheafsModule,
    VotesModule,
    PubSubModule,
  ],
  providers: [TwigsService, TwigsResolver],
  exports: [TwigsService],
})
export class TwigsModule {}
