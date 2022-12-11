import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { User } from "src/users/user.model";
import { Alert } from "../alert.model";

@ObjectType()
export class GetCurrentUserAlertsResult {
  @Field(() => User)
  user: User;

  @Field(() => [Alert])
  alerts: Alert[];
}