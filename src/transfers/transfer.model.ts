
import { ObjectType, Field } from '@nestjs/graphql';
import { Arrow } from 'src/arrows/arrow.model';
import { User } from 'src/users/user.model';
import { Vote } from 'src/votes/vote.model';
@ObjectType()
export class Transfer {
  @Field()
  id: string;

  @Field()
  senderId: string;

  @Field(() => User)
  sender: User;

  @Field()
  receiverId: string;

  @Field(() => User)
  receiver: User;
  
  @Field()
  points: number;

  @Field()
  reason: string;

  @Field()
  voteId: string;

  @Field(() => Vote)
  vote: Vote;
  
  @Field()
  arrowId: string;


  @Field(() => Arrow)
  arrow: Arrow;

  @Field()
  createDate: Date;
  
  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}