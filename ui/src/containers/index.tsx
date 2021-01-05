import React from "react";
import ApolloContainer from "./ApolloContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";

const Container: React.FC = ({ children }) => (
  <ApolloContainer>
    <ReduxContainer>
      <IonicContainer>{children}</IonicContainer>
    </ReduxContainer>
  </ApolloContainer>
);

export default Container;
