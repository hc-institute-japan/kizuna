import React from 'react';
import ApolloContainer from './ApolloContainer';
import NavigationContainer from './NavigationContainer';
import ReduxContainer from './ReduxContainer';

const Container: React.FC = ({children}) => (
  <ApolloContainer>
    <ReduxContainer>
      <NavigationContainer>{children}</NavigationContainer>
    </ReduxContainer>
  </ApolloContainer>
);

export default Container;
