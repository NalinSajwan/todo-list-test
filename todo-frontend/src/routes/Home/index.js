import React from 'react';
import { useHistory, withRouter } from 'react-router-dom';

import {
  Container
} from 'reactstrap';

import {NotificationContainer, NotificationManager} from 'react-notifications';

// App Components.
import Header from './../../components/Header';
import TodoAdd from './../../components/TodoAdd';
import TodoList from './../../components/TodoList';

import './../../styles/home.css';

const Home = () => {

  const history = useHistory();

  let auth = localStorage.getItem("authenticated");

  if (window.location.pathname !== "/" && ( auth === null || ( auth !== null && auth !== "true" ) ) ) {
    history.push("/");
  }

  return (
    <div className={"app-main-container"}>
      <Header/>
      <div className={"app-main-content-wrapper"}>
        <Container className="app-container">
          <div className={"todo-section border"}>
            <TodoAdd/>
            <TodoList notify={NotificationManager}/>
          </div>
        </Container>
        <NotificationContainer />
      </div>
    </div>
  )
};

export default withRouter(Home);