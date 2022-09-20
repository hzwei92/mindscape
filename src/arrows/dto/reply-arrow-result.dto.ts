import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "../arrow.model";

@ObjectType()
export class ReplyArrowResult {
  @Field(() => Arrow)
  source: Arrow;

  @Field(() => Arrow)
  link: Arrow;

  @Field(() => Arrow)
  target: Arrow;
}