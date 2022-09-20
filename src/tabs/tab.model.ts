
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/users/user.model';
import { Arrow } from 'src/arrows/arrow.model';

@ObjectType()
export class Tab {
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
  i: number;

  @Field()
  isFrame: boolean;

  @Field()
  isFocus: boolean;

  @Field()
  createDate: Date;
  
  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}