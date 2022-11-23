import { makeVar } from '@apollo/client';
import { RefObject } from 'react';
import { PosType } from './features/space/space';
import { IdToType } from './types';

export const spaceElVar = makeVar({} as RefObject<HTMLIonCardElement>);
export const adjustTwigIdToPosVar = makeVar({} as IdToType<PosType>);