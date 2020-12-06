const { makeExecutableSchema } = require('graphql-tools')
  , { merge } = require('lodash');

// Type Definitions.
const todoDef = require('./types/todo')

// Resolvers.
  , todoResolver = require('./queries/todo')

// Mutations.
  , todoMutation = require('./mutations/todo')

const resolvers = merge(
  // Resolvers.
  todoResolver

  // Mutations.
  , todoMutation
);

const schema = makeExecutableSchema({
  typeDefs: [
    todoDef
  ],
  resolvers
});

module.exports = schema;