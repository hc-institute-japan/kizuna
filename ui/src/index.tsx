import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import Container from "./containers";
import "./theme/global.css";

ReactDOM.render(
  <Container>
    <App />
  </Container>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
