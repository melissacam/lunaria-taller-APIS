import { createServer } from 'node:http';
import { createYoga, createSchema } from 'graphql-yoga';
import { conectarDB } from '../config/db.js';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './resolvers.js';

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/graphql',
  cors: { origin: '*' },   // permite que el frontend (otro puerto) lo consuma
});

const puerto = process.env.GRAPHQL_PORT || 3002;
await conectarDB();
createServer(yoga).listen(puerto, () =>
  console.log(`API GraphQL en http://localhost:${puerto}/graphql`)
);