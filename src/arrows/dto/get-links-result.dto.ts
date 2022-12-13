import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
import { Arrow } from "../arrow.model";

@ObjectType()
export class GetLinksResult {
  @Field(() => User)
  user: User;
  
  @Field(() => [Arrow])
  arrows: Arrow[];
}