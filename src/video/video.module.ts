import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideoService } from './video.service';
import { VideoResolver } from './video.resolver';

@Module({
  imports: [ConfigModule],
  providers: [VideoService, VideoResolver],
  exports: [VideoService],
})
export class VideoModule {}
