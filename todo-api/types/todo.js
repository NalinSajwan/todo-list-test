const { gql } = require('apollo-server');

const Todo = gql `
"""
Definition of a todo item entry.
"""
type Todo {
  """
  Mongodb id.
  """
  _id: String!
  """
  Name of Todo item.
  """
  name: String!
  """
  Date on which item was added.
  """
  createdAt: String!
  """
  Date on which item was modified.
  """
  modifiedAt: String!
  """
  Does this item has a parent.
  """
  parentId: String
  """
  Is item completed.
  """
  complete: Boolean!
}

"""
Nesting queries inside Todo object.
"""
type TodoQuery {
  """
  Get all todo items.
  """
  get: [Todo]
}

"""
All queries of Todo.
"""
type Query {
  """
  Used to contain all the queries related to Todo.
  """
  Todo: TodoQuery!
}

"""
Nesting queries inside Todo object.
"""
type TodoMutation {
  """
  Add todo item.
  """
  add(name: String!): Todo!
  """
  Remove todo item.
  """
  remove(id: String!): String!
  """
  Remove completed todo item.
  """
  removeCompleted: String!
  """
  Update todo item.
  """
  update(id: String!, name: String!, complete: Boolean, parentId: String): Todo!
  """
  Update completion of todo item.
  """
  updateCompletion(complete: [String], notComplete: [String]): [Todo!]
}

"""
All mutations of Todo.
"""
type Mutation {
  """
  Used to contain all the queries related to Todo.
  """
  Todo: TodoMutation!
}
`;

module.exports = Todo;