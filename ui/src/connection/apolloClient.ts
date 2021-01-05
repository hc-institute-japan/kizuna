import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { callZome, getAgentId } from "./holochainClient";
import resolvers from "../graphql/resolvers";
import typeDefs from "../graphql/schemas";

const schemaLink = new SchemaLink({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers,
  }),
  context: { callZome, getAgentId },
});

const links = [];

links.push(schemaLink);

const link = ApolloLink.from(links);

const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache({ addTypename: false }),
  connectToDevTools: true,
});

export default apolloClient;
