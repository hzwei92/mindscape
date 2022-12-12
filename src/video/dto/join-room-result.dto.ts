import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class JoinRoomResult {
  @Field()
  token: string;
}