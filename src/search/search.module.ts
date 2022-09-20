import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchService } from './search.service';

@Module({
  imports: [ConfigModule],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
