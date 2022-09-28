import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
import { Arrow } from "../arrow.model";

@ObjectType()
export class ReplyArrowResult {
  @Field(() => User)
  user: User;
  
  @Field(() => Arrow)
  source: Arrow;

  @Field(() => Arrow)
  link: Arrow;

  @Field(() => Arrow)
  target: Arrow;
}