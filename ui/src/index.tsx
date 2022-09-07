import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import Container from "./containers";
import "./theme/global.css";

import { ErrorBoundary } from "react-error-boundary";
import ErrorHandler from "./containers/ErrorHandlerContainer";
import { errorBoundaryHandler } from "./components/ErrorBoundary";

ReactDOM.render(
  <Container>
    <meta http-equiv="Pragma" content="no-cache" />
    <meta
      http-equiv="cache-control"
      content="no-cache, no-store, must-revalidate"
    />
    <ErrorBoundary
      FallbackComponent={ErrorHandler}
      onError={errorBoundaryHandler}
    >
      <App />
    </ErrorBoundary>
  </Container>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
