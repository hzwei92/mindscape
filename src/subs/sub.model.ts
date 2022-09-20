import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class Sub {
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
  
  @Field()
  createDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}