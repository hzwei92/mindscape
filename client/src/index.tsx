import React from 'react';
import ReactDOM from 'react-dom';
import App from './app/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { createRestartableClient } from './app/graphql';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { ACCESS_TOKEN, DEV_SERVER_URI, DEV_WS_SERVER_URI, PROD_SERVER_URI, PROD_WS_SERVER_URI } from './constants';
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { isPlatform } from '@ionic/react';
import { setContext } from '@apollo/client/link/context';
import { Preferences } from '@capacitor/preferences';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

defineCustomElements(window);

const wsClient = createRestartableClient({
  url: process.env.NODE_ENV === 'production'
    ? isPlatform('ios') || isPlatform('android')
      ? `${PROD_WS_SERVER_URI}/graphql`
      : window.location.origin.replace(/^http/, 'ws') + '/graphql'
    : `${DEV_WS_SERVER_URI}/graphql`,
  connectionParams: () => {
    const cookies = document.cookie.split('; ');
    let authCookie;
    cookies.some(cookie => {
      authCookie = cookie.match(/^Authentication=.*$/);
      return !!authCookie;
    })
    if (authCookie && authCookie[0]) {
      return {
        Authentication: (authCookie[0] as string).split('=')[1]
      };
    }
    return {};
  },
});

const wsLink = new GraphQLWsLink(wsClient);

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production'
    ? isPlatform('ios') || isPlatform('android')
      ? `${PROD_SERVER_URI}/graphql`
      : '/graphql'
    : `${DEV_SERVER_URI}/graphql`,
  credentials: process.env.NODE_ENV === 'production'
    ? isPlatform('ios') || isPlatform('android')
      ? 'include'
      : 'same-origin'
    : 'include'
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const accessToken = await Preferences.get({
    key: ACCESS_TOKEN,
  })
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      accesstoken: accessToken.value,
    }
  }
});


const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
