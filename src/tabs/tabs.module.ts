import { Module } from '@nestjs/common';
import { TabsService } from './tabs.service';
import { TabsResolver } from './tabs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tab } from './tab.entity';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { SheafsModule } from 'src/sheafs/sheafs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tab]),
    ArrowsModule,
    SheafsModule,
  ],
  providers: [TabsService, TabsResolver],
  exports: [TabsService],
})
export class TabsModule {}
