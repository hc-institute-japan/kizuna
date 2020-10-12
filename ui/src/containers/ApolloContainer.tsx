import React from 'react';
import {ApolloProvider} from '@apollo/client';
import apolloClient from '../connection/apolloClient';

const ApolloContainer: React.FC = ({children}) => (
  <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
);

export default ApolloContainer;
