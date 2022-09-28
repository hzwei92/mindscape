import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { User } from "src/users/user.model";
import { Vote } from "../vote.model";

@ObjectType()
export class VoteArrowResult {
  @Field(() => User)
  user: User;
  
  @Field(() => Arrow)
  arrow: Arrow;
  
  @Field(() => [Vote])
  votes: Vote[];
}
