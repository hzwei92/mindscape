import { connectHits } from 'react-instantsearch-dom';
import { v4 as uuidv4 } from 'uuid'; 
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { searchRefresh, searchSpliceSlice, selectSearchSlice } from './searchSlice';
import { Entry } from '../entry/entry';
import { addEntry, selectIdToEntry } from '../entry/entrySlice';
import { IdToType } from '../../types';
import useGetArrows from '../arrow/useGetArrows';

interface HitsProps {
  hits: any[];
}
function Hits(props: HitsProps) {
  const slice = useAppSelector(selectSearchSlice);
  const idToEntry = useAppSelector(selectIdToEntry)
  const dispatch = useAppDispatch();

  const { getArrows } = useGetArrows(() => {
    dispatch(searchRefresh(true));
  });

  useEffect(() => {
    console.log(props.hits);
    const idToEntry1: IdToType<Entry> = {};
    const entryIds: string[] = [];
    const userIds: string[] = [];
    if (props.hits.length) {
      props.hits.forEach(hit => {
        if (hit.__typename === 'User') {
          userIds.push(hit.id);
        }
        else if (hit.__typename === 'Arrow') {
          let entryId;
          slice.entryIds.some(id => {
            if (idToEntry[id].arrowId === hit.id) {
              entryId = id;
              return true;
            }
            return false;
          });
          if (entryId) {
            entryIds.push(entryId);
          }
          else {
            const entry: Entry = {
              id: uuidv4(),
              userId: hit.userId,
              parentId: '',
              arrowId: hit.id,
              showOuts: false,
              showIns: false,
              outIds: [],
              inIds: [],
              sourceId: null,
              targetId: null,
              shouldGetLinks: false
            };
            idToEntry1[entry.id] = entry;
            entryIds.push(entry.id);
          }
        }
      });

      const arrowIds: string[] = [];
      Object.keys(idToEntry1).forEach(id => {
        const entry = idToEntry1[id];
        dispatch(addEntry(entry));
        arrowIds.push(entry.arrowId);
      });

      if (arrowIds.length) {
        getArrows(arrowIds);
      }
    }

    dispatch(searchSpliceSlice({
      ...slice,
      entryIds,
      userIds,
    }));
  }, [props.hits])

  return null;
}

const CustomHits = connectHits(Hits);

export default CustomHits