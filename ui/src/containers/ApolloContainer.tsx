import { ApolloProvider } from "@apollo/client";
import React from "react";
import client from "../connection/apolloClient";

const ApolloContainer: React.FC = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloContainer;
