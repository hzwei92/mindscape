import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/user.model";
@ObjectType()
export class UserWithTokens {
  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
