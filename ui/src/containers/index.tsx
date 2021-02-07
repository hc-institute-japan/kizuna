import React from "react";

import IntlContainer from "./IntlContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";
import RouterContainer from "./RouterContainer";

const Container: React.FC = ({ children }) => (
  <ReduxContainer>
    <IonicContainer>
      <IntlContainer>
        <RouterContainer> {children}</RouterContainer>
      </IntlContainer>
    </IonicContainer>
  </ReduxContainer>
);

export default Container;
