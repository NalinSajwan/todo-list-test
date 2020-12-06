import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from 'react-apollo';
import Routes from './routes';
import 'bootstrap/dist/css/bootstrap.min.css';

// Loadin Devextreme css.
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';

import 'react-notifications/lib/notifications.css';

// Custom styles.
import './styles/base.css';

const client = new ApolloClient({
  uri: 'http://localhost:4000/api',
});

const App = () => {
  return (
    <div className={"app-main"}>
      <ApolloProvider client={client}>
        <Routes/>
      </ApolloProvider>
    </div>
  );
};

const rootElement = document.getElementById('app-site');
ReactDOM.render(<App />, rootElement);