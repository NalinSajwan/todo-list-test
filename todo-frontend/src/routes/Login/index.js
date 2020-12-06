import React, { useState } from 'react';
import { useHistory, withRouter } from 'react-router-dom';

import {
  Col
  , Form
  , FormGroup
  , Label
  , Input
  , Button
} from 'reactstrap';

import {NotificationContainer, NotificationManager} from 'react-notifications';

import { userCredentials } from './../../constants/AppContants';

import './../../styles/login.css'

const Login = () => {

  const history = useHistory();

  const [ username, updateUser ] = useState("");
  const [ password, updatePass ] = useState("");

  const onSubmit = () => {
    if (userCredentials.username === username.trim() && userCredentials.password === password.trim()) {
      localStorage.setItem("authenticated", true);
      history.push("/home");
    } else {
      NotificationManager.error(`Username or password is incorrect`, 'Wrong credentials', 3000);
    }
  };

  return (
    <React.Fragment>
      <div className={"app-login-container d-flex align-items-center justify-content-center"}>
        <div className={"app-login-main-content"}>
          <h2>Sign In</h2>
          <Form className="form">
            <Col>
              <FormGroup>
                <Label>Username</Label>
                <Input
                  value={username}
                  type="email"
                  name="email"
                  id="exampleEmail"
                  placeholder="username"
                  onChange={(e) => updateUser(e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label for="examplePassword">
                  Password
                </Label>
                <Input
                  value={password}
                  type="password"
                  name="password"
                  id="examplePassword"
                  placeholder="password"
                  onChange={(e) => updatePass(e.target.value)}
                />
              </FormGroup>
            </Col>
            <Button onClick={onSubmit}>Submit</Button>
          </Form>
        </div>
      </div>
      <NotificationContainer />
    </React.Fragment>
  );
};

export default withRouter(Login);