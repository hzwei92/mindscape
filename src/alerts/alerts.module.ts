import { forwardRef, Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsResolver } from './alerts.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './alert.entity';
import { RolesModule } from 'src/roles/roles.module';
import { LeadsModule } from 'src/leads/leads.module';
import { UsersModule } from 'src/users/users.module';
import { ArrowsModule } from 'src/arrows/arrows.module';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArrowsModule),
    forwardRef(() => RolesModule),
    LeadsModule,
    PubSubModule,
  ],
  providers: [AlertsService, AlertsResolver],
  exports: [AlertsService],
})
export class AlertsModule {}
