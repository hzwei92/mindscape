import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "../arrow.model";

@ObjectType()
export class LinkArrowsResult {
  @Field(() => Arrow)
  source: Arrow;

  @Field(() => Arrow)
  target: Arrow;

  @Field(() => Arrow)
  link: Arrow;

}