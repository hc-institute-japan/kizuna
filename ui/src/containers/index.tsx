import React from "react";
import CallModalContainer from "./CallModalContainer";
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
            <CallModalContainer>
              <ToastContainer>
                <ErrorHandler>{children}</ErrorHandler>
              </ToastContainer>
            </CallModalContainer>
          </IntlContainer>
        </ReduxContainer>
      </RouterContainer>
    </IonicContainer>
  );
};

export default Container;
