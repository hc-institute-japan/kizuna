import React from "react";

import IntlContainer from "./IntlContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";
import RouterContainer from "./RouterContainer";

const Container: React.FC = ({ children }) => (
  <IonicContainer>
    <RouterContainer>
      <ReduxContainer>
        <IntlContainer>{children}</IntlContainer>
      </ReduxContainer>
    </RouterContainer>
  </IonicContainer>
);

export default Container;
