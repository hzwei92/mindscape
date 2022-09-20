import { forwardRef, Module } from '@nestjs/common';
import { SheafsService } from './sheafs.service';
import { SheafsResolver } from './sheafs.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sheaf } from './sheaf.entity';
import { ArrowsModule } from 'src/arrows/arrows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sheaf]),
    forwardRef(() => ArrowsModule),
  ],
  providers: [SheafsService, SheafsResolver],
  exports: [SheafsService],
})
export class SheafsModule {}
