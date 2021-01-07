import React from "react";
import ApolloContainer from "./ApolloContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";
import RouterContainer from "./RouterContainer";

const Container: React.FC = ({ children }) => (
  <ApolloContainer>
    <ReduxContainer>
      <IonicContainer>
        <RouterContainer> {children}</RouterContainer>
      </IonicContainer>
    </ReduxContainer>
  </ApolloContainer>
);

export default Container;
