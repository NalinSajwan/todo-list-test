const express = require('express')
  , cors = require("cors")
  , { ApolloServer } = require("apollo-server-express")
  , mongoose = require("./config/mongoose")
  , schema = require('./schema')

// Code variables.
  , port = process.env.PORT || 4000;

const app = express();
const path = '/api';

app.use("*", cors());

const server = new ApolloServer({ schema, introspection: true, playground: true });
server.applyMiddleware({ app, path });

app.listen({ port }, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  const db = mongoose();
});