import { MOBILE_WIDTH } from './constants';
import { v4 } from 'uuid';
import { RoleType } from './features/role/role';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const month = 30 * day;
const year = 365 * day;

export const getTimeString = (time: number) => {
  const dTime = Math.max(0, Date.now() - time);
  return (
    dTime > year 
    ? (dTime / year).toFixed(0) + 'yr'
    : dTime > month
      ? (dTime / month).toFixed(0) + 'mo'
      : dTime > week 
        ? (dTime / week).toFixed(0) + 'w'
        : dTime > day 
          ? (dTime / day).toFixed(0) + 'd'
          : dTime > hour
            ? (dTime / hour).toFixed(0) + 'h'
            : dTime > minute 
              ? (dTime / minute).toFixed(0) + 'min'
              : 'LIVE!'
  );
};


export const getAppbarWidth = (width: number) => {
  return width < MOBILE_WIDTH
    ? 45
    : 55
}
export const getColWidth = (width: number) => {
  return width < MOBILE_WIDTH 
    ? width - 42
    : Math.min(350, width - 60)
}

export const getColor = (mode: 'dark' | 'light', isDim?: boolean) => {
  return isDim
    ? mode === 'dark'
      ? 'darkgrey'
      : 'dimgrey'
    : mode === 'dark'
      ? 'ghostwhite'
      : 'dimgrey';
}


export const scaleDown = (scale: number) => {
  const scale1 = scale > 2
    ? 2
    : scale > 1.5
      ? 1.5
      : scale > 1
        ? 1
        : scale > .75
          ? .75
          : scale > .5
            ? .5
            : scale > .25
              ? .25
              : scale > .125
                ? .125
                : scale > .0625
                  ? .0625
                  : .03125
  return scale1;
}

export const scaleUp = (scale: number) => {
  const scale1 = scale < .0625
    ? .0625
    : scale < .125
      ? .125
      : scale < .25
        ? .25
        : scale < .5
          ? .5
          : scale < .75
            ? .75
            : scale < 1
              ? 1
              : scale < 1.5
                ? 1.5
                : scale < 2
                  ? 2
                  : 4;
  return scale1;
}

export const getPolylineCoords = (segmentDist: number, x1: number, y1: number, x2: number, y2: number) => {
  if (
    typeof segmentDist === 'undefined' ||
    typeof x1 === 'undefined' ||
    typeof y1 === 'undefined' || 
    typeof x2 === 'undefined' || 
    typeof y2 === 'undefined'
  ) {
    return ''
  }
  const dist = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow(y2 -y1, 2));

  const segCount = dist / segmentDist;
  const dx = (x2 - x1) / segCount;
  const dy = (y2 - y1) / segCount;

  let str = `${x1},${y1} `;
  let x = x1;
  let y = y1;
  for (let i = 0; i < dist; i+= segmentDist) {
    str += `${x + dx},${y + dy} `
    x += dx;
    y += dy;
  }
  return str
}

export const getEmptyDraft = () => {
  const blocks = [{
    key: v4(),
    text: '',
    type: 'unstyled',
    depth: 0,
    inlineStyleRanges: [],
    entityRanges: [],
    data: {},
  }];
  
  const draft = JSON.stringify({
    blocks,
    entityMap: {}
  });
  
  return draft;
}

export const checkPermit = (permissionLevel: string | undefined, roleType?: string) => {
  return permissionLevel === RoleType.NONE
    ? false
    : permissionLevel === RoleType.ADMIN
      ? roleType === RoleType.ADMIN
      : permissionLevel === RoleType.MEMBER
        ? roleType === RoleType.ADMIN || roleType === RoleType.MEMBER
        : permissionLevel === RoleType.SUBSCRIBER
          ? roleType === RoleType.ADMIN || roleType === RoleType.MEMBER || roleType === RoleType.SUBSCRIBER
          : true;
}

export const getTwigColor = (color?: string | null) => {
  if (color) {
    if (color === 'grey') {
      return '#b2b4b8';
    }
    if (color === 'blue') {
      return '#8ab4f8';
    }
    if (color === 'red') {
      return '#f28b82';
    }
    if (color === 'yellow') {
      return '#fad663';
    }
    if (color === 'green') {
      return '#81c995';
    }
    if (color === 'pink') {
      return '#fb8bcb';
    }
    if (color === 'purple') {
      return '#c58af9';
    }
    if (color === 'cyan') {
      return '#78d9ec';
    }
    if (color === 'orange') {
      return '#faad70';
    }
    return color;
  }
  return null
}

export const geography = [
  'abime', 
  'abyssalfan', 
  'abyssalplain', 
  'ait', 
  'alluvialfan', 
  'anabranch', 
  'arch', 
  'archipelago', 
  'arete', 
  'arroyo', 
  'atoll', 
  'ayre', 
  'badlands', 
  'bar', 
  'barchan', 
  'bar', 
  'island', 
  'bay', 
  'bar', 
  'bayou', 
  'beach', 
  'cusps', 
  'ridge', 
  'bench', 
  'bight', 
  'blowhole', 
  'blowout', 
  'bluff', 
  'bornhardt', 
  'channel', 
  'butte', 
  'calanque', 
  'caldera', 
  'canyon', 
  'cape', 
  'cave', 
  'cenote', 
  'channel', 
  'cirque', 
  'corrie', 
  'cliff', 
  'coast', 
  'col', 
  'crater', 
  'volcano', 
  'confluence', 
  'shelf', 
  'reef', 
  'cove', 
  'splay', 
  'crevasse', 
  'cryovolcano', 
  'cuesta', 
  'foreland', 
  'bank', 
  'dale', 
  'defile', 
  'dell', 
  'river', 
  'pavement', 
  'diatreme', 
  'dike', 
  'cone', 
  'plateau', 
  'doab', 
  'doline', 
  'dome', 
  'basin', 
  'divide', 
  'dreikanter', 
  'drumlin', 
  'lake', 
  'dune', 
  'system', 
  'blanket', 
  'basin', 
  'erg', 
  'escarpment', 
  'esker', 
  'estuary', 
  'channel', 
  'spur', 
  'scarp', 
  'firth', 
  'vent', 
  'fjard', 
  'fjord', 
  'flat', 
  'flatiron', 
  'floodplain', 
  'island', 
  'terrace', 
  'foiba', 
  'geo', 
  'geyser', 
  'horn', 
  'cave', 
  'foreland', 
  'glacier', 
  'roy', 
  'glen', 
  'gorge', 
  'graben', 
  'gulch', 
  'gully', 
  'guyot', 
  'valley', 
  'headland', 
  'hill', 
  'hogback', 
  'ridge', 
  'hoodoo', 
  'horst', 
  'crater', 
  'inlet', 
  'interfluve', 
  'relief', 
  'island', 
  'islet', 
  'isthmus', 
  'delta', 
  'kame', 
  'karst', 
  'valley', 
  'kettle', 
  'puka', 
  'knoll', 
  'plain', 
  'lagoon', 
  'lake', 
  'dome', 
  'lava', 
  'lake', 
  'plain', 
  'spine', 
  'tube', 
  'lavaka', 
  'levee', 
  'pavement', 
  'loess', 
  'terraces', 
  'maar', 
  'machair', 
  'mamelon', 
  'terrace', 
  'marsh', 
  'massif', 
  'meander', 
  'mesa', 
  'ridge', 
  'mogote', 
  'monadnock', 
  'moraine', 
  'moulin', 
  'mountain', 
  'pass', 
  'range', 
  'rock', 
  'arch', 
  'nunatak', 
  'oasis', 
  'basin', 
  'plateau', 
  'ridge', 
  'trench', 
  'fan', 
  'plain', 
  'pediment', 
  'pediplain', 
  'peneplain', 
  'peninsula', 
  'pingo', 
  'crater', 
  'plain', 
  'plateau', 
  'pool', 
  'bar', 
  'polje', 
  'pond', 
  'potrero', 
  'basin', 
  'quarry', 
  'beach', 
  'ravine', 
  'ria', 
  'ridge', 
  'riffle', 
  'valley', 
  'river', 
  'delta', 
  'island', 
  'moraine', 
  'formations', 
  'shelter', 
  'basin', 
  'saddle', 
  'marsh', 
  'pan', 
  'sandhill', 
  'sandur', 
  'scowle', 
  'scree', 
  'cave', 
  'seamount', 
  'shoal', 
  'shore', 
  'in', 
  'valley', 
  'sinkhole', 
  'sound', 
  'spit', 
  'spring', 
  'stack', 
  'strait', 
  'strandflat', 
  'strath', 
  'stratovolcano', 
  'pool', 
  'stream', 
  'ridge', 
  'bench', 
  'terrace', 
  'mound', 
  'canyon', 
  'volcano', 
  'summit', 
  'supervolcano', 
  'channel', 
  'swamp', 
  'tepui', 
  'terrace', 
  'terracette', 
  'pavement', 
  'thalweg', 
  'marsh', 
  'pool', 
  'tombolo', 
  'tor', 
  'karst', 
  'towhead', 
  'line', 
  'spur', 
  'valley', 
  'turlough', 
  'tuya', 
  'valley', 
  'uvala', 
  'valley', 
  'ventifact', 
  'arc', 
  'cone', 
  'crater', 
  'lake', 
  'dam', 
  'field', 
  'group', 
  'island', 
  'plateau', 
  'plug', 
  'volcano', 
  'wadi', 
  'waterfall', 
  'watershed', 
  'platform', 
  'wetland', 
  'yardang', 
  'sea', 
  'arroyo', 
  'pond', 
  'barachois', 
  'bay', 
  'bayou', 
  'beck', 
  'bight', 
  'billabong', 
  'boil', 
  'bog', 
  'bourn', 
  'brook', 
  'brooklet', 
  'burn', 
  'canal', 
  'channel', 
  'cove', 
  'creek', 
  'delta', 
  'channel', 
  'basin', 
  'draw', 
  'estuary', 
  'firth', 
  'gill', 
  'glacier', 
  'pothole', 
  'gulf', 
  'harbor', 
  'spring', 
  'impoundment', 
  'inlet', 
  'kill', 
  'lagoon', 
  'lake', 
  'loch', 
  'swamp', 
  'marsh', 
  'mere', 
  'pond', 
  'moat', 
  'ocean', 
  'lake', 
  'phytotelma', 
  'pool', 
  'pond', 
  'port', 
  'pothole', 
  'puddle', 
  'pool', 
  'reservoir', 
  'rill', 
  'river', 
  'rivulet', 
  'roadstead', 
  'run', 
  'marsh', 
  'sea', 
  'loch', 
  'lough', 
  'seep', 
  'slough', 
  'source', 
  'shoal', 
  'sound', 
  'spring', 
  'strait', 
  'stream', 
  'pool', 
  'lake', 
  'swamp', 
  'tank', 
  'tarn', 
  'wadi', 
  'wash', 
]