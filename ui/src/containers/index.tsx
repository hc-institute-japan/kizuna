import React from "react";
import ErrorContainer from "./ErrorContainer";

import IntlContainer from "./IntlContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";
import RouterContainer from "./RouterContainer";
import ToastContainer from "./ToastContainer";

const Container: React.FC = ({ children }) => (
  <IonicContainer>
    <ReduxContainer>
      <RouterContainer>
        <IntlContainer>
          <ToastContainer>
            <ErrorContainer>{children}</ErrorContainer>
          </ToastContainer>
        </IntlContainer>
      </RouterContainer>
    </ReduxContainer>
  </IonicContainer>
);

export default Container;
