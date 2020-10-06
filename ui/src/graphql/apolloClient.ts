import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';
import {ApolloLink} from 'apollo-link';
import {onError} from 'apollo-link-error';
// import apolloLogger from "apollo-link-logger";
import {SchemaLink} from 'apollo-link-schema';
import {makeExecutableSchema} from 'graphql-tools';
// import {callAdmin, callZome, hcUprtcl, onSignal} from './holochainClient';
import resolvers from './resolvers';
import typeDefs from './typeDefs';

// This needs to be refactored so that the connection to holochain is established
// even before any query or mutation is called from the components.
// also, it would be better to include the callZome as a context.

const schemaLink = new SchemaLink({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers,
  }),
  context: {
    // callZome: callZome,
    // hcUprtcl: hcUprtcl,
    // onSignal: onSignal,
    // callAdmin: callAdmin,
  },
});

const links = [
  ...(process.env.NODE_ENV !== 'test' && [
    onError(({graphQLErrors, networkError}) => {
      // if (graphQLErrors) {
      //   console.group("GraphQL Errors: ");
      //   graphQLErrors.map(({ message, locations, path }, index) =>
      //     console.log(
      //       `${
      //         index + 1
      //       }: Message: ${message}, Location: ${locations}, Path: ${path}`
      //     )
      //   );
      //   console.groupEnd();
      // }
      // if (networkError) {
      //   console.group("Network Error: ");
      //   console.log(networkError);
      //   console.groupEnd();
      // }
    }),
  ]),
  // apolloLogger,
  schemaLink,
];

const link = ApolloLink.from(links);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default apolloClient;
