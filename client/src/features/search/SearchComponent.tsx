import { InstantSearch } from 'react-instantsearch-dom';
import algoliasearch, { SearchClient } from 'algoliasearch';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import CustomSearchBox from './SearchBox';
import CustomHits from './Hits';
import { ALGOLIA_APP_ID, ALGOLIA_APP_KEY, ALGOLIA_INDEX_NAME, OFF_WHITE } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { searchGoBack, searchGoForward, searchRefresh, selectSearchIndex, selectSearchShouldRefresh, selectSearchSlice, selectSearchStack } from './searchSlice';
import EntryTree from '../entry/EntryTree';
import { IonButton, IonButtons, IonCard, IonCardHeader, IonContent, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, ScrollDetail } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, close, reload } from 'ionicons/icons';
import { AppContext } from '../../app/App';
import { MenuMode } from '../menu/menu';
import useGetAlerts from '../alerts/useGetAlerts';

function SearchComponent() {
  const dispatch = useAppDispatch();

  const { palette, menuMode } = useContext(AppContext);

  const stack = useAppSelector(selectSearchStack);
  const index = useAppSelector(selectSearchIndex);
  const slice = useAppSelector(selectSearchSlice);

  const shouldRefreshDraft = useAppSelector(selectSearchShouldRefresh);
  const [searchClient, setSearchClient] = useState(null as SearchClient | null);

  const contentRef = useRef<HTMLIonContentElement>(null);
 
  const { getAlerts } = useGetAlerts();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchClient(algoliasearch(ALGOLIA_APP_ID, ALGOLIA_APP_KEY))
  }, []);

  useEffect(() => {
    if (shouldRefreshDraft) {
      dispatch(searchRefresh(false));
    }
  }, [shouldRefreshDraft])

  useEffect(() => {
    if (menuMode === MenuMode.SEARCH) {
      contentRef.current?.scrollToPoint(0, 50, 300)
    }
  }, [menuMode])

  const handleBackClick = (event: React.MouseEvent) => {
    dispatch(searchGoBack());
  };

  const handleForwardClick = (event: React.MouseEvent) => {
    dispatch(searchGoForward());
  };

  const handleScroll = (event: CustomEvent<ScrollDetail>) => {

  }

  if (!searchClient) return null;

  return (
    <IonCard style={{
      margin: 0,
      borderRadius: 0,
      width: '100%',
      height: '100%',
      backgroundColor: palette === 'dark'
        ? '#000000'
        : OFF_WHITE,
    }}>
      <IonCardHeader style={{
        padding: 10,
      }}>
        SEARCH
      </IonCardHeader>
      <InstantSearch searchClient={searchClient} indexName={ALGOLIA_INDEX_NAME}>
        <IonCard style={{
          display: 'flex',
          flexDirection: 'row',
          margin: 0,
          border: palette === 'dark'
            ? '1px solid dimgrey'
            : '1px solid lavender',
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
        <IonContent 
          ref={contentRef}
          scrollEvents={true}
          onIonScroll={handleScroll}
          style={{
            height: 'calc(100% - 80px)',
            width: '100%',
          }}
        >
          <IonInfiniteScroll
            onIonInfinite={(e: any) => {
              setIsLoading(true);
              getAlerts();
              setTimeout(() => {
                e.target.complete()
                setIsLoading(false)
              }, 300)
            }}
            position='top'
            style={{
              height: 50,
            }}
          >
            <IonInfiniteScrollContent loadingSpinner={'dots'} style={{
              position: 'relative',
            }}>
              <IonButtons style={{
                display: isLoading
                  ? 'none'
                  :  'flex',
                position: 'absolute',
                top: 10,
                left: 'calc(50% - 20px)',
              }}>
                <IonButton>
                  <IonIcon icon={reload} size='small'/>
                </IonButton>
              </IonButtons>
            </IonInfiniteScrollContent>
          </IonInfiniteScroll>
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
        </IonContent>
      </InstantSearch>
    </IonCard>
  )
}

export default memo(SearchComponent);