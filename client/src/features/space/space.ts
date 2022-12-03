import React from "react";
import { IdToType } from "../../types";
import { Role } from "../role/role";
import { Twig } from "../twig/twig";

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

export type AvatarType = {
  id: string;
  abstractId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  date: Date;
  timeout: ReturnType<typeof setTimeout>;
};


export type SpaceData = {
  selectedTwigId: string;
  idToPos: IdToType<PosType>;
  idToHeight: IdToType<number>;
  idToTwig: IdToType<Twig>;
  iToTwigId: IdToType<string>;
  shouldReloadTwigTree: boolean;
  idToChildIdToTrue: IdToType<IdToType<true>>;
  idToDescIdToTrue: IdToType<IdToType<true>>;
  idToAvatar: IdToType<AvatarType>;
  idToRole: IdToType<Role>;
};