import { forwardRef, Module } from '@nestjs/common';
import { TabsService } from './tabs.service';
import { TabsResolver } from './tabs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tab } from './tab.entity';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { SheafsModule } from 'src/sheafs/sheafs.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Tab]),
    forwardRef(() => UsersModule),
    ArrowsModule,
    SheafsModule,
  ],
  providers: [TabsService, TabsResolver],
  exports: [TabsService],
})
export class TabsModule {}
