import React from "react";
import ErrorContainer from "./ErrorContainer";

import IntlContainer from "./IntlContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";
import RouterContainer from "./RouterContainer";
import ToastContainer from "./ToastContainer";

const Container: React.FC = ({ children }) => (
  <IonicContainer>
    <ToastContainer>
      <ErrorContainer>
        <RouterContainer>
          <ReduxContainer>
            <IntlContainer>{children}</IntlContainer>
          </ReduxContainer>
        </RouterContainer>
      </ErrorContainer>
    </ToastContainer>
  </IonicContainer>
);

export default Container;
