import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { UsersModule } from 'src/users/users.module';
import { Sub } from './sub.entity';
import { SubsResolver } from './subs.resolver';
import { SubsService } from './subs.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Sub]),
    forwardRef(() => ArrowsModule),
    forwardRef(() => UsersModule)
  ],
  providers: [SubsResolver, SubsService],
  exports: [SubsService],
})
export class SubsModule {}
