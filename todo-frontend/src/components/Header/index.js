import React from 'react';
import { useHistory, withRouter } from 'react-router-dom';

import {
  Navbar,
  NavbarBrand,
  NavbarText
} from 'reactstrap';

import './../../styles/header.css';

const Header = () => {
  const history = useHistory();

  /**
   * Logout from application.
   */
  const logout = () => {
    localStorage.removeItem("authenticated");
    history.push("/");
  };

  return (
    <header className={"app-header"}>
      <Navbar color="light" light expand="md">
        <NavbarBrand href="/">Todo List</NavbarBrand>
        <NavbarText onClick={logout}>Logout</NavbarText>
      </Navbar>
    </header>
  );
};

export default withRouter(Header);