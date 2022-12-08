import { forwardRef, Module } from '@nestjs/common';
import { TabsService } from './tabs.service';
import { TabsResolver } from './tabs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tab } from './tab.entity';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { SheafsModule } from 'src/sheafs/sheafs.module';
import { TransfersModule } from 'src/transfers/transfers.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tab]),
    forwardRef(() => UsersModule),
    ArrowsModule,
    SheafsModule,
    TransfersModule,
  ],
  providers: [TabsService, TabsResolver],
  exports: [TabsService],
})
export class TabsModule {}
