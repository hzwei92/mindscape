import { useContext, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { gql, useMutation } from "@apollo/client";
import { FULL_TAB_FIELDS } from "../tab/tabFragments";
import { mergeTabs } from "../tab/tabSlice";
import { AppContext } from "../../app/App";
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonNote, useIonRouter } from "@ionic/react";
import { uniqueNamesGenerator, adjectives } from "unique-names-generator";
import { INPUT_WIDTH } from "../../constants";
import { mergeUsers } from "../user/userSlice";
import { close, dice } from "ionicons/icons";

const geography = [
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

const CREATE_GRAPH = gql`
  mutation CreateGraphTab($name: String!, $routeName: String!, $arrowId: String) {
    createGraphTab(name: $name, routeName: $routeName, arrowId: $arrowId) {
      user {
        id
        balance
      }
      tabs {
        ...FullTabFields
      }
    } 
  }
  ${FULL_TAB_FIELDS}
`;

const GET_ARROW_BY_ROUTENAME = gql`
  mutation GetArrowByRouteName($routeName: String!) {
    getArrowByRouteName(routeName: $routeName) {
      id
    }
  }
`;

export default function CreateGraphModal() {
  const dispatch = useAppDispatch();

  const router = useIonRouter();

  const { 
    user,
    isCreatingGraph,
    setIsCreatingGraph,
    createGraphArrowId,
    setCreateGraphArrowId,
  } = useContext(AppContext);

  const [name, setName] = useState('');
  const [routeName, setRouteName] = useState('');
  const [routeError, setRouteError] = useState('');
  const [routeTimeout, setRouteTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  const [isReady, setIsReady] = useState(false);

  const randomizeName = () => {
    const name1 = uniqueNamesGenerator({
      dictionaries: [adjectives, geography],
      length: 2,
      separator: '-'
    }) + '-' + Math.round(Math.random() * 1000).toString().padStart(3, '0');
    setName(name1);
    setRouteName(name1);
  };

  useEffect(() => {
    if (!isCreatingGraph) {
      randomizeName();
    }
  }, []);

  const [create] = useMutation(CREATE_GRAPH, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data, routeName);
      const { user, tabs } = data.createGraphTab;
      
      dispatch(mergeUsers([user]))
      dispatch(mergeTabs(tabs));

      router.push(`/g/${routeName}/0`);

      randomizeName();
    }
  });

  const [getArrowByRouteName] = useMutation(GET_ARROW_BY_ROUTENAME, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      if (data.getArrowByRouteName?.id) {
        setRouteError('Route name already in use');
      } 
      else {
        setRouteError('');
      }
      setIsReady(true);
    },
  });

  useEffect(() => {
    if (!routeName) return; 
    const route = routeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (route !== routeName) {
      setRouteName(route);
      return;
    }
    if (routeTimeout) {
      clearTimeout(routeTimeout);
    }
    const t = setTimeout(() => {
      getArrowByRouteName({
        variables: {
          routeName: route,
        }
      });
      setRouteTimeout(null);
    }, 500);

    setRouteTimeout(t); 
    setRouteError('');
    setIsReady(false);
  }, [routeName]);

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  }

  const handleRouteNameChange = (e: any) => {
    setRouteName(e.target.value);
  }

  const handleClose = () => {
    setIsCreatingGraph(false);
    setCreateGraphArrowId(null);
  }

  const handleSubmitClick = () => {
    create({
      variables: {
        name,
        routeName,
        arrowId: createGraphArrowId,
      },
    });
    setIsCreatingGraph(false);
  }

  return (
    <IonModal isOpen={isCreatingGraph} onWillDismiss={handleClose}>
      <IonCard style={{
        margin: 0,
        height: '100%',
      }}>
        <IonCardHeader style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          fontSize: 80,
          textAlign: 'center'
        }}>
          New graph...
        </IonCardHeader>
        <IonCardContent style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
            <div style={{
              marginBottom: 40,
              textAlign: 'center',
            }}>
              Choose a <b>name</b> for the graph and a <b style={{whiteSpace: 'nowrap'}}>route-name</b> for its URL.
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                marginTop: -20,
                marginLeft: -20,
                marginRight: 10,
              }}>
                <IonButtons>
                  <IonButton onClick={() => randomizeName()}>
                    <IonIcon icon={dice} />
                  </IonButton>
                </IonButtons>
              </div>
              <div>
                <IonItem style={{
                  width: INPUT_WIDTH,
                  borderRadius: 5,
                  marginBottom: 20,
                  border: '1px solid',
                }}>
                  <IonInput
                    placeholder='Name'
                    value={name}
                    onIonChange={handleNameChange}
                    style={{
                    }}
                  />
                  <IonButtons>
                    <IonButton color='medium' onClick={() => setName('')}>
                      <IonIcon icon={close} />
                    </IonButton>
                  </IonButtons>
                </IonItem>
                <IonItem style={{
                  width: INPUT_WIDTH,
                  borderRadius: 5,
                  marginBottom: 20,
                  border: '1px solid',
                }}>
                  <IonInput
                    placeholder="route-name"
                    value={routeName}
                    onIonChange={handleRouteNameChange}
                    style={{
                    }}
                  />
                  <IonButtons>
                    <IonButton color='medium' onClick={() => setRouteName('')}>
                      <IonIcon icon={close} />
                    </IonButton>
                  </IonButtons>
                  <IonNote slot='error'>
                    { routeError }
                  </IonNote>
                </IonItem>
                    
                </div>
            </div>
            <IonButtons style={{
              marginTop: 50,
            }}>
              <IonButton disabled={!!routeError || !isReady || routeName.length === 0} onClick={handleSubmitClick}>
                CREATE
              </IonButton>
              &nbsp;&nbsp;
              <IonButton onClick={handleClose}>
                CANCEL
              </IonButton>
            </IonButtons>
        </IonCardContent>
      </IonCard>
    </IonModal>
  )
}