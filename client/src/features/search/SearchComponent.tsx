import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch, { SearchClient } from 'algoliasearch';
import { useContext, useEffect, useRef, useState } from 'react';
import CustomSearchBox from './SearchBox';
import CustomHits from './Hits';
import { ALGOLIA_APP_ID, ALGOLIA_APP_KEY, ALGOLIA_INDEX_NAME, APP_BAR_HEIGHT, MAX_Z_INDEX } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { searchGoBack, searchGoForward, searchRefresh, selectSearchIndex, selectSearchShouldRefresh, selectSearchSlice, selectSearchStack } from './searchSlice';
import EntryTree from '../entry/EntryTree';
import { IonButton, IonButtons, IonCard, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, close } from 'ionicons/icons';

export default function SearchComponent() {
  const dispatch = useAppDispatch();

  const stack = useAppSelector(selectSearchStack);
  const index = useAppSelector(selectSearchIndex);
  const slice = useAppSelector(selectSearchSlice);

  console.log('slice', slice, stack, index);

  const shouldRefreshDraft = useAppSelector(selectSearchShouldRefresh);
  const [searchClient, setSearchClient] = useState(null as SearchClient | null);

  const containerEl = useRef<HTMLElement>();
 
  const [showResizer, setShowResizer] = useState(false);

  useEffect(() => {
    setSearchClient(algoliasearch(ALGOLIA_APP_ID, ALGOLIA_APP_KEY))
  }, []);

  useEffect(() => {
    if (shouldRefreshDraft) {
      dispatch(searchRefresh(false));
    }
  }, [shouldRefreshDraft])

  const handleBackClick = (event: React.MouseEvent) => {
    dispatch(searchGoBack());
  };

  const handleForwardClick = (event: React.MouseEvent) => {
    dispatch(searchGoForward());
  };

  const handleClose = () => {

  };

  const handleResizeMouseEnter = (event: React.MouseEvent) => {
    setShowResizer(true);
  };

  const handleResizeMouseLeave = (event: React.MouseEvent) => {
    setShowResizer(false);
  };

  const handleResizeMouseDown = (event: React.MouseEvent) => {
    // setSearchMenuIsResizing(true);
  };

  if (!searchClient) return null;

  return (
    <div style={{
      height: 'calc(100% - 10px)',
      width: '100%',
    }}>
      <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
        <IonCard style={{
          display: 'flex',
          flexDirection: 'row',
          marginBottom: 5,
        }}>
          <IonButtons style={{ whiteSpace: 'nowrap', paddingRight: 1,}}>
            <IonButton
              title='Go back'
              disabled={index <= 0} 
              size='small'
              color='inherit'
              onClick={handleBackClick}
            >
              <IonIcon icon={chevronBackOutline} />
            </IonButton>
            <IonButton
              title='Go forward'
              disabled={index >= stack.length - 1} 
              size='small'
              color='inherit'
              onClick={handleForwardClick}
            >
              <IonIcon icon={chevronForwardOutline} />
            </IonButton> 
          </IonButtons>
          <div style={{
            width: '100%',
          }}> 
            <CustomSearchBox defaultRefinement='5fda8f9c-42a0-4b42-bad0-ef30b0af14b0'/>
            <CustomHits />
          </div>
        </IonCard>
        <div  style={{
          height: 'calc(100% - 50px)',
          width: '100%',
          overflowY: 'scroll',
        }}>
          { 
            slice.entryIds.map((entryId) => {
              return (
                <EntryTree
                  key={`surveyor-search-tree-${entryId}`}
                  entryId={entryId}
                  depth={0}
                />
              );
            })
          }
          <div style={{height: '10px'}}/>
        </div>
      </InstantSearch>
    </div>
  )
}