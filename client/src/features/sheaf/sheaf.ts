import { Arrow } from "../arrow/arrow";

export type Sheaf  = {
  id: string;
  routeName: string;
  url: string;

  sourceId: string;
  source: Sheaf;
  targetId: string;
  target: Sheaf;

  ins: Sheaf[];
  outs: Sheaf[];
  inCount: number;
  outCount: number;
  
  arrows: Arrow[];
  
  weight: number;
  
  createDate: Date | null;
  updateDate: Date | null;
  deleteDate: Date | null;
}
