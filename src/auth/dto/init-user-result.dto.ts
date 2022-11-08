import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
@ObjectType()
export class InitUserResult {
  @Field(() => User)
  user: User;

  @Field()
  auth: string;

  @Field()
  refresh: string;
}
