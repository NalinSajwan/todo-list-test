const { ApolloServer } = require("apollo-server")
  , mongoose = require("./config/mongoose")
  , schema = require('./schema')

// Code variables.
  , port = process.env.PORT || 4000;

const opts = {
  port: port,
  endpoint: '/api',
  playground: '/playground'
};

const server = new ApolloServer({ schema });

server.listen(opts).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
  const db = mongoose();
});