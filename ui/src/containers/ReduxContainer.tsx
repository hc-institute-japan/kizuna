import React from "react";
import { Provider } from "react-redux";
import store from "../redux/store";

const ReduxContainer: React.FC = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

export default ReduxContainer;
