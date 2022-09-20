import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class Vote {
  @Field()
  id: string;
  
  @Field()
  userId: string;
  
  @Field(() => User)
  user: User;

  @Field()
  arrowId: string;

  @Field(() => Arrow)
  arrow: Arrow;

  @Field(() => Int)
  clicks: number;

  @Field(() => Int)
  tokens: number;

  @Field(() => Int)
  weight: number;
  
  @Field()
  createDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}