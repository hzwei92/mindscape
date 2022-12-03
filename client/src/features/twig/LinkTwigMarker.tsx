import React, { useContext, useState } from 'react';
import { useAppSelector } from '../../app/store';
import { MAX_Z_INDEX, VIEW_RADIUS } from '../../constants';
import { getPolylineCoords } from '../../utils';
import { selectArrowById } from '../arrow/arrowSlice';
import { PosType } from '../space/space';
import { SpaceContext } from '../space/SpaceComponent';
import { selectSelectedTwigId } from '../space/spaceSlice';
import { selectUserById } from '../user/userSlice';
import type { Twig } from './twig';
import useSelectTwig from './useSelectTwig';

interface LinkTwigMarkerProps {
  twig: Twig;
  sourcePos: PosType | null;
  targetPos: PosType | null;
}
function LinkTwigMarker(props: LinkTwigMarkerProps) {
  const { 
    abstractId,
    abstract, 
    canEdit,
  } = useContext(SpaceContext);
  const selectedTwigId = useAppSelector(selectSelectedTwigId(abstractId));
  const isSelected = props.twig.id === selectedTwigId;
  
  const [linkI, setLinkI] = useState(0);
  const [clickTimeout, setClickTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const { selectTwig } = useSelectTwig();

  

  // useEffect(() => {
  //   if (links.length > 1) {
  //     const time = 1000 / Math.log(links.length);
  //     const interval = setInterval(() => {
  //       setLinkI(linkI => (linkI + 1) % (links.length));
  //     }, time);
  //     return () => {
  //       clearInterval(interval);
  //     }
  //   }
  // }, [links.length]);

  const link = useAppSelector(state => selectArrowById(state, props.twig.detailId))
  const linkUser = useAppSelector(state => selectUserById(state, link?.userId));

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isSelected) {
      selectTwig(abstract, props.twig, canEdit);
    }
  }

  const rating = 1;
  return (
    <g onClick={handleClick} onMouseDown={handleMouseDown} style={{
      cursor: 'pointer',
      zIndex: props.twig.z,
    }}>
      <polyline 
        points={getPolylineCoords(
          10 + (20 * (isSelected ? rating + 1 : rating)),
          (props.sourcePos?.x ?? 0) + VIEW_RADIUS,
          (props.sourcePos?.y ?? 0) + VIEW_RADIUS,
          (props.targetPos?.x ?? 0) + VIEW_RADIUS,
          (props.targetPos?.y ?? 0) + VIEW_RADIUS,
        )}
        strokeWidth={1 + (isSelected ? 1 : 0) + rating}
        markerMid={`url(#marker-${link?.userId})`}
        markerEnd={`url(#marker-${link?.userId})`}
      />
      <line 
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          opacity: isSelected 
            ? .5
            : .3,
        }}
        x1={(props.sourcePos?.x ?? 0) + VIEW_RADIUS}
        y1={(props.sourcePos?.y ?? 0) + VIEW_RADIUS}
        x2={(props.targetPos?.x ?? 0) + VIEW_RADIUS}
        y2={(props.targetPos?.y ?? 0) + VIEW_RADIUS}
        strokeWidth={10 * ((isSelected ? 2 : 1) + rating)}
        stroke={linkUser?.color}
        strokeLinecap={'round'}
      />
    </g>
  )
}

export default React.memo(LinkTwigMarker)