import {ApolloClient, InMemoryCache, ApolloLink} from '@apollo/client';
import {SchemaLink} from '@apollo/client/link/schema';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {callZome} from './holochainClient';
import resolvers from './resolvers';
import typeDefs from './typeDefs';

const schemaLink = new SchemaLink({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers,
  }),
  context: {callZome},
});

const links = [];

links.push(schemaLink);

const link = ApolloLink.from(links);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default apolloClient;
