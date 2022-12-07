import { Arrow } from "../arrow/arrow";
import { Lead } from "../lead/lead";
import { Role } from "../role/role";
import { User } from "../user/user";


export type Alert = {
  id: string;
  userId: string;
  user: User;
  sourceId: string | null;
  source: Arrow | null;
  linkId: string | null;
  link: Arrow | null;
  targetId: string | null;
  target: Arrow | null;
  leadId: string | null;
  lead: Lead | null;
  roleId: string | null;
  role: Role | null;
  abstractRoleId: string | null;
  abstractRole: Role | null;
  reason: string;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
}

export enum AlertReason {
  REPLY = 'REPLY',
  LINK = 'LINK',
  OTHER = 'OTHER',
  FEED = 'FEED',
}