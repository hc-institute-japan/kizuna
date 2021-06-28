import React from "react";
import ErrorHandler from "./ErrorHandlerContainer";
import IntlContainer from "./IntlContainer";
import IonicContainer from "./IonicContainer";
import ReduxContainer from "./ReduxContainer";
import RouterContainer from "./RouterContainer";
import ToastContainer from "./ToastContainer";

const Container: React.FC = ({ children }) => {
  return (
    <IonicContainer>
      <RouterContainer>
        <ReduxContainer>
          <IntlContainer>
            <ToastContainer>
              <ErrorHandler>{children}</ErrorHandler>
            </ToastContainer>
          </IntlContainer>
        </ReduxContainer>
      </RouterContainer>
    </IonicContainer>
  );
};

export default Container;
