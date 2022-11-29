import { useContext, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { gql, useMutation } from "@apollo/client";
import { FULL_TAB_FIELDS } from "../tab/tabFragments";
import { mergeTabs } from "../tab/tabSlice";
import { AppContext } from "../../app/App";
import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonInput, IonModal, useIonRouter } from "@ionic/react";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

const CREATE_GRAPH = gql`
  mutation CreateGraphTab($name: String!, $routeName: String!, $arrowId: String) {
    createGraphTab(name: $name, routeName: $routeName, arrowId: $arrowId) {
      ...FullTabFields
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

  useEffect(() => {
    if (isCreatingGraph) {
      if (createGraphArrowId) {
        setName('');
        setRouteName('');
      }
      else {
        const name1 = uniqueNamesGenerator({
          dictionaries: [adjectives, animals],
          length: 2,
          separator: '-'
        }) + '-' + Math.round(Math.random() * 1000).toString().padStart(3, '0');
        setName(name1);
        setRouteName(name1);
      }
    }
  }, [isCreatingGraph]);

  const [create] = useMutation(CREATE_GRAPH, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data, routeName);
      dispatch(mergeTabs(data.createGraphTab));
      router.push(`/g/${routeName}/0`);
      setRouteName('');
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
          marginBottom: 60,
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
              Select a name for the graph and a route-name for its URL.
            </div>
            <IonInput
              placeholder='Name'
              value={name}
              onIonChange={handleNameChange}
              style={{
                border: '1px solid',
                borderRadius: 5,
                marginBottom: 20,
                width: 300,
              }}
            />
            <IonInput
              placeholder="route-name"
              value={routeName}
              onIonChange={handleRouteNameChange}
              style={{
                border: '1px solid',
                borderRadius: 5,
                marginBottom: 20,
                width: 300,
              }}
            />
            {routeError && <div>{routeError}</div>}
            <IonButtons style={{
              marginTop: 80,
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