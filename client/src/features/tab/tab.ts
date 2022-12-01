import { Arrow } from "../arrow/arrow";
import { User } from "../user/user";


export type Tab = {
  id: string;
  userId: string;
  user: User;
  arrowId: string;
  arrow: Arrow;
  i: number;
  isFrame: boolean;
  isFocus: boolean;
  createDate: string;
  updateDate: string;
  deleteDate: string | null;
}

