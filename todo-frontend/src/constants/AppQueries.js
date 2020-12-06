import gql from "graphql-tag";

export const GET_ALL_TODOS = gql`
  query {
    Todo {
      get {
        id: _id
        name
        parentId
        complete
      }
    }
  }
`;

export const DELETE_TODO_MUTATION = gql`
  mutation remove($id: String!) {
    Todo {
      remove(id: $id)
    }
  }
`;

export const DELETE_COMPLETED_TODO_MUTATION = gql`
  mutation {
    Todo {
      removeCompleted
    }
  }
`;

export const UPDATE_TODO_MUTATION = gql`
  mutation update($id: String!, $name: String!, $complete: Boolean, $parentId: String) {
    Todo {
      update(id: $id, name: $name, complete: $complete, parentId: $parentId) {
        id: _id
        name
        complete
        parentId
      }
    }
  }
`;

export const ADD_TODO_MUTATION = gql`
  mutation add($name: String!) {
    Todo {
      add(name: $name) {
        id: _id
        name
        createdAt
        modifiedAt
        complete
        parentId
      }
    }
  }
`;

export const UPDATE_COMPLETION_TODO_MUTATION = gql`
  mutation updateCompletion($complete: [String], $notComplete: [String]) {
    Todo {
      updateCompletion(complete: $complete, notComplete: $notComplete) {
        id: _id
        name
        parentId
        complete
      }
    }
  }
`;