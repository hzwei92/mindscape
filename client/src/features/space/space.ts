import React from "react";
import { IdToType } from "../../types";

export enum SpaceType {
  FRAME = 'FRAME',
  FOCUS = 'FOCUS',
};

export type PosType = {
  x: number;
  y: number
};

export type ScrollState = {
  left: number;
  top: number;
};

export type DragState = {
  isScreen: boolean;
  twigId: string;
  targetTwigId: string;
};


export type SpaceState = {
  isOpen: boolean;
  selectedTwigId: string;
  spaceEl: React.MutableRefObject<HTMLElement | undefined> | null;
  scale: number;
  scroll: ScrollState;
  cursor: PosType;
  drag: DragState;
  idToPos: IdToType<PosType>;
  idToHeight: IdToType<number>;
}