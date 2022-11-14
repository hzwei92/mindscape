import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

export const PUB_SUB = 'PUB_SUB';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PUB_SUB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dateReviver = (key, value) => {
          const isISO8601Z = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
          if (typeof value === 'string' && isISO8601Z.test(value)) {
            const tempDateNumber = Date.parse(value);
            if (!isNaN(tempDateNumber)) {
              return new Date(tempDateNumber);
            }
          }
          return value;
        };

        return new RedisPubSub({
          publisher: new Redis(configService.get('REDIS_URL')),
          subscriber: new Redis(configService.get('REDIS_URL')),
          reviver: dateReviver,
        });
      },
    }
  ],
  exports: [PUB_SUB]
})
export class PubSubModule {}
