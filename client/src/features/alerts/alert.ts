import { Arrow } from "../arrow/arrow";
import { Lead } from "../lead/lead";
import { Role } from "../role/role";
import { User } from "../user/user";


export type Alert = {
  id: string;
  userId: string;
  user: User;
  arrowId: string | null;
  arrow: Arrow | null;
  leadId: string | null;
  lead: Lead | null;
  roleId: string | null;
  role: Role | null;
  abstractRoleId: string | null;
  abstractRole: Role | null;
  readDate: Date | null;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
}