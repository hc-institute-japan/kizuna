import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import Container from "./containers";
import "./theme/global.css";

import { ErrorBoundary } from "react-error-boundary";
import ErrorHandler from "./containers/ErrorHandlerContainer";
import {
  errorBoundaryHandler,
  errorBoundaryFallback,
} from "./components/ErrorBoundary";

ReactDOM.render(
  <ErrorBoundary
    fallback={<div>Oh no. An error occurred. Please refresh the page.</div>}
    onError={errorBoundaryHandler}
  >
    <Container>
      <meta http-equiv="Pragma" content="no-cache" />
      <meta
        http-equiv="cache-control"
        content="no-cache, no-store, must-revalidate"
      />
      <App />
    </Container>
  </ErrorBoundary>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
