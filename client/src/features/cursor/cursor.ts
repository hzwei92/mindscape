
export type Cursor = {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  date: Date;
  timeout: ReturnType<typeof setTimeout>
}
export type IdToCursorType = {
  [id: string]: Cursor;
}