import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
import { Arrow } from "../arrow.model";

@ObjectType()
export class SaveArrowResult {
  @Field(() => User)
  user: User;

  @Field(() => Arrow)
  arrow: Arrow;
}