import React from 'react';
import { LOAD_LIMIT } from '../../constants';
import { useAppSelector } from '../../app/store';
import { selectIdToEntry } from './entrySlice';
import { selectIdToArrow } from '../arrow/arrowSlice';
import EntryComponent from './EntryComponent';
import useGetOuts from '../arrow/useGetOuts';
import useGetIns from '../arrow/useGetIns';
import { IonLabel } from '@ionic/react';

interface EntryTreeProps {
  entryId: string;
  depth: number;
}

export default function EntryTree(props: EntryTreeProps) {
  const idToEntry = useAppSelector(selectIdToEntry);
  const entry = idToEntry[props.entryId];
  
  const idToArrow = useAppSelector(selectIdToArrow);
  const arrow = idToArrow[entry.arrowId];
  
  const { getIns } = useGetIns(props.entryId, entry?.arrowId);
  const { getOuts } = useGetOuts(props.entryId, entry?.arrowId);

  if (!entry) return null;

  const handleLoadClick = (event: React.MouseEvent) => {
    if (entry.showIns) {
      getIns(entry.inIds.length);
    }
    else if (entry.showOuts) {
      getOuts(entry.outIds.length);
    }
  }

  let remaining = 0;
  let entryIds = [] as string[];

  if (entry.showIns) {
    entryIds = entry.inIds;
    remaining = entryIds.length > 0
      ? Math.min(LOAD_LIMIT, arrow.inCount - entryIds.length)
      : 0;
  }
  else if (entry.showOuts) {
    entryIds = entry.outIds;
    remaining = entryIds.length > 0 
      ? Math.min(LOAD_LIMIT, arrow.outCount - entryIds.length)
      : 0;
  }
  else {
    if (entry.sourceId && entry.sourceId !== entry.parentId) {
      entryIds.push(entry.sourceId);
    }
    if (entry.targetId && entry.targetId !== entry.parentId) {
      entryIds.push(entry.targetId);
    }
  }

  if (!arrow?.id || arrow.isOpaque) return null;

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <EntryComponent
          entry={entry}
          depth={props.depth}
        />
      </div>
      <div style={{
        borderLeft: `2px solid ${arrow.user.color}`,
        marginLeft: '8px',
      }}>
        {
          entryIds.map(entryId => {
            return (
              <EntryTree
                key={`surveyor-tree-${entryId}`}
                entryId={entryId}
                depth={props.depth + 1}
              />
            )
          })
        }
        {
          remaining > 0
            ? <div onClick={handleLoadClick} style={{
                fontSize: 12,
                marginTop: '5px',
                marginLeft: '10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}>
                <IonLabel style={{
                  color: arrow.user.color,
                }}>
                  load {remaining} more
                </IonLabel>
              </div>
            : null
        }
      </div>
    </div>
  );
}