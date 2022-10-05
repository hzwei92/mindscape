import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi'
import { join } from 'path';
import { Context } from 'apollo-server-core';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { ArrowsModule } from './arrows/arrows.module';
import { VotesModule } from './votes/votes.module';
import { SubsModule } from './subs/subs.module';
import { SearchModule } from './search/search.module';
import { RolesModule } from './roles/roles.module';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { LeadsModule } from './leads/leads.module';
import { EmailModule } from './email/email.module';
import { TwigsModule } from './twigs/twigs.module';
import { SheafsModule } from './sheafs/sheafs.module';
import { TabsModule } from './tabs/tabs.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(9000),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'build'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: configService.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
        keepConnectionAlive: true,
      })
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [
        ConfigModule,
        JwtModule.register({
          secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        }),
        UsersModule,
      ],
      inject: [ConfigService, JwtService, UsersService],
      useFactory: async (configServce: ConfigService, jwtService: JwtService, usersService: UsersService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        //installSubscriptionHandlers: true,
        subscriptions: {
          'graphql-ws': {
            onConnect: async (context: Context<any>) => {
              const { connectionParams, extra } = context;
              if (connectionParams?.Authentication) {
                const payload: any = jwtService.decode(connectionParams.Authentication);
                const user = await usersService.getUserById(payload.userId);
                extra.user = user;
              }
            }
          }
        },
        context: ({req, res, connection, extra}) => ({req, res, connection, extra}),
        cors: {
          origin: [
            'capacitor://localhost',
            'http://localhost',
            'http://localhost:8100',
            'http://localhost:8081',
            'http://localhost:3000',
            'chrome-extension://dfgclbhmaeilnpimjliggfdiidoaccgc',
            'chrome-extension://ilcoblgjlneeglihjhkpdhbgbjmcmcej'
          ],
          credentials: true,
        }
      })
    }),
    ArrowsModule,
    AuthModule,
    EmailModule,
    LeadsModule,
    PubSubModule,
    RolesModule,
    SearchModule,
    SubsModule,
    UsersModule,
    VotesModule,
    TwigsModule,
    SheafsModule,
    TabsModule,
    TransfersModule,
  ],
})
export class AppModule {}
