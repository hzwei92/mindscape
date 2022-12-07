import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { User } from "src/users/user.model";

@ObjectType()
export class ReadAlertsResult {
  @Field(() => User)
  user: User;

  @Field(() => [Arrow])
  arrows: Arrow[];
}