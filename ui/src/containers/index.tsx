import React from "react";

import IntlContainer from "./IntlContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";
import RouterContainer from "./RouterContainer";
import ToastContainer from "./ToastContainer";

const Container: React.FC = ({ children }) => (
  <IonicContainer>
    <RouterContainer>
      <ReduxContainer>
        <IntlContainer>
          <ToastContainer>{children}</ToastContainer>
        </IntlContainer>
      </ReduxContainer>
    </RouterContainer>
  </IonicContainer>
);

export default Container;
