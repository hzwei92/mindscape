import { IonButton, IonButtons, IonIcon, IonInput } from '@ionic/react';
import { search } from 'ionicons/icons';
import React, { useContext } from 'react';
import { connectSearchBox } from 'react-instantsearch-dom';
import { AppContext } from '../../app/App';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { searchPushSlice, searchSpliceSlice, selectSearchSlice } from './searchSlice';

interface SearchBoxProps {
  currentRefinement: string;
  isSearchStalled: boolean;
  refine: any;
}

function SearchBox(props: SearchBoxProps) {
  const { palette } = useContext(AppContext);
  const slice = useAppSelector(selectSearchSlice);
  const dispatch = useAppDispatch();


  const handleChange = (event: any) => {
    dispatch(searchSpliceSlice({
      ...slice,
      query: event.target.value,
    }));
  }

  const refineQuery = () => {
    const query = slice.query;
    console.log('refineQuery', query);
    dispatch(searchPushSlice({
      originalQuery: query, 
      query, 
      entryIds: [],
      userIds: [],
    }));
    props.refine(slice.query);
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      refineQuery();
    }
  }

  if (!slice) return null;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
    }}>
      <IonInput
        style={{
          height: 40,
          fontSize: 20,
          width: 'calc(100%)',
          color: palette === 'dark' ? 'white' : 'black',
        }}
        type={'text'}
        placeholder={'Search...'}
        value={slice.query}
        onIonChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <IonButtons>
        <IonButton onClick={() => refineQuery()}>
          <IonIcon icon={search} />
        </IonButton>
      </IonButtons>
    </div>
  )
}

const CustomSearchBox = connectSearchBox(SearchBox)

export default CustomSearchBox