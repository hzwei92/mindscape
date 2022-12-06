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
  arrowId: string;

  @Field(() => Arrow, {nullable: true})
  arrow: Arrow;

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

  @Field({ nullable: true })
  readDate: Date;

  @Field()
  createDate: Date;

  @Field()
  updateDate: Date;

  @Field({ nullable: true })
  deleteDate: Date;
}