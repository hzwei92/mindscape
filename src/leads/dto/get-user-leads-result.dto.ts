import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Lead } from '../lead.model';

@ObjectType()
export class GetUserLeadsResult {
  @Field(() => [Lead])
  leaders: Lead[];

  @Field(() => [Lead])
  followers: Lead[];
}