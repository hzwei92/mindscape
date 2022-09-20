
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class Role {
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
  type: string;

  @Field()
  isInvited: boolean;

  @Field()
  isRequested: boolean;

  @Field()
  createDate: Date;
  
  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}