import React from "react";
import { Provider } from "react-redux";
import store from "../redux/store";

interface Props {}

const ReduxContainer: React.FC<Props> = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

export default ReduxContainer;
