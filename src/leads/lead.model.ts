import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/user.model';

@ObjectType()
export class Lead {
  @Field()
  id: string;

  @Field()
  leaderId: string;

  @Field(() => User)
  leader: User;

  @Field()
  followerId: string;

  @Field(() => User)
  follower: User;
  
  @Field()
  createDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}