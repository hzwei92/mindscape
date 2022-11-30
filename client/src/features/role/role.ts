import { Arrow } from '../arrow/arrow';
import { User } from '../user/user';

export type Role = {
  id: string;
  userId: string;
  user: User;
  arrowId: string;
  arrow: Arrow;
  type: RoleType;
  isInvited: boolean;
  isRequested: boolean;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
  __typename: string;
}


export enum RoleType {
  NONE = 'NONE',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  SUBSCRIBER = 'SUBSCRIBER',
  OTHER = 'OTHER',
};