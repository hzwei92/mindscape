import { Field, ObjectType } from "@nestjs/graphql";
import { Arrow } from "src/arrows/arrow.model";
import { Lead } from "src/leads/lead.model";
import { Role } from "src/roles/role.model";
import { User } from "src/users/user.model";

@ObjectType()
export class Alert {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => User)
  user: User;  
  
  @Field({nullable: true})
  sourceId: string;

  @Field(() => Arrow, {nullable: true})
  source: Arrow;

  @Field({nullable: true})
  linkId: string;

  @Field(() => Arrow, {nullable: true})
  link: Arrow;

  @Field({nullable: true})
  targetId: string;

  @Field(() => Arrow, {nullable: true})
  target: Arrow;


  @Field({nullable: true})
  leadId: string;

  @Field(() => Lead, {nullable: true})
  lead: Lead;

  @Field({nullable: true})
  roleId: string;

  @Field(() => Role, {nullable: true})
  role: Role;

  @Field({nullable: true})
  abstractRoleId: string;

  @Field(() => Role, {nullable: true})
  abstractRole: Role;


  @Field()
  reason: string;

  @Field()
  createDate: Date;

  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}