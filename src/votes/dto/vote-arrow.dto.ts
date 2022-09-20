import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { Vote } from "../vote.model";

@ObjectType()
export class VoteArrowResult {
  @Field(() => Arrow)
  arrow: Arrow;
  
  @Field(() => [Vote])
  votes: Vote[];
}
