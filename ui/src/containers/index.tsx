import React from "react";
import ApolloContainer from "./ApolloContainer";
import IntlContainer from "./IntlContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";
import RouterContainer from "./RouterContainer";

const Container: React.FC = ({ children }) => (
  <ApolloContainer>
    <ReduxContainer>
      <IonicContainer>
        <IntlContainer>
          <RouterContainer> {children}</RouterContainer>
        </IntlContainer>
      </IonicContainer>
    </ReduxContainer>
  </ApolloContainer>
);

export default Container;
