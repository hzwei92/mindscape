import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchModule } from 'src/search/search.module';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { RolesModule } from 'src/roles/roles.module';
import { LeadsModule } from 'src/leads/leads.module';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { SheafsModule } from 'src/sheafs/sheafs.module';
import { TabsModule } from 'src/tabs/tabs.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([User]),
    SheafsModule,
    ArrowsModule,
    RolesModule,
    LeadsModule,
    SearchModule,
    PubSubModule,
    TabsModule,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
