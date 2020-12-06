import React from "react";
import { Query } from "react-apollo";

import { GET_ALL_TODOS } from './../../constants/AppQueries';

import TreeView from './../TreeView';

const TodoList = (props) => {
  return (
    <Query
      query={GET_ALL_TODOS}
      fetchPolicy="network-only"
    >
      {({ loading, error, data, client }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error</p>;

        return (
          <TreeView
            items={data.Todo.get}
            client={client}
            notify={props.notify}
          />
        );
      }}
    </Query>
  );
};

export default TodoList;