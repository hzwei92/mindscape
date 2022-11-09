import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RolesService } from './roles.service';
import { RolesResolver } from './roles.resolver';
import { UsersModule } from 'src/users/users.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArrowsModule),
    PubSubModule,
  ],
  providers: [RolesService, RolesResolver],
  exports: [RolesService],
})
export class RolesModule {}
