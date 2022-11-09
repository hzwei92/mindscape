import { forwardRef, Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsResolver } from './leads.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { UsersModule } from 'src/users/users.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Lead]),
    forwardRef(() => UsersModule),
    PubSubModule,
  ],
  providers: [LeadsService, LeadsResolver],
  exports: [LeadsService],
})
export class LeadsModule {}
