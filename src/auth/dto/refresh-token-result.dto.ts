import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class RefreshTokenResult {
  @Field()
  accessToken: string;
}
