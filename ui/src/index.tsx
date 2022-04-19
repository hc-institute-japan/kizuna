import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import Container from "./containers";
import "./theme/global.css";

// // Adding the profile elements we need
import "@holochain-open-dev/profiles";
// import "@holochain-open-dev/profiles/list-profiles";
// import "@holochain-open-dev/profiles/search-agent";

// // Add the context-provider element
import "@holochain-open-dev/context";

ReactDOM.render(
  <Container>
    <App />
  </Container>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
