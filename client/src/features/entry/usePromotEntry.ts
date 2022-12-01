import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { IdToType } from '../../types';
import { searchPushSlice } from '../search/searchSlice';
import { Entry } from './entry';
import { mergeEntries, selectIdToEntry } from './entrySlice';

type UpdateUnit = {
  oldEntry: Entry;
  newEntry: Entry;
}
export default function usePromoteEntry() {
  const dispatch = useAppDispatch();

  const idToEntry = useAppSelector(selectIdToEntry);

  const promoteEntry = (entry: Entry) => {
    const idToEntry1 = {} as IdToType<Entry>;

    const rootEntry = {
      ...entry,
      id: v4(),
      parentId: '',
      inIds: [],
      outIds: [],
    } as Entry;

    idToEntry1[rootEntry.id] = rootEntry;

    const units = [{
      oldEntry: entry,
      newEntry: rootEntry,
    }] as UpdateUnit[];

    while (units.length) {
      const unit = units.shift() as UpdateUnit;
      
      unit.oldEntry.inIds.forEach(entryId => {
        const prev = idToEntry[entryId];
        const newEntry = {
          ...prev,
          id: v4(),
          inIds: [],
          outIds: [],
        } as Entry;
        idToEntry1[newEntry.id] = newEntry;
        unit.newEntry.inIds.push(newEntry.id);
        units.push({
          oldEntry: prev,
          newEntry,
        })
      });

      unit.oldEntry.outIds.forEach(entryId => {
        const next = idToEntry[entryId];
        const newEntry = {
          ...next,
          id: v4(),
          inIds: [],
          outIds: [],
        } as Entry;
        idToEntry1[newEntry.id] = newEntry;
        unit.newEntry.outIds.push(newEntry.id);
        units.push({
          oldEntry: next,
          newEntry,
        });
      });
    }
    dispatch(mergeEntries(idToEntry1));
    dispatch(searchPushSlice({
      query: '',
      originalQuery: '',
      entryIds: [rootEntry.id],
      userIds: [],
    }));
  }

  return { promoteEntry };
}