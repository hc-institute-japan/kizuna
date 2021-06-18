import React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import createStore from "../redux/store";

export let store: Store | undefined;
store = createStore();

const ReduxContainer: React.FC = ({ children }) => (
  <Provider store={store as Store}>{children}</Provider>
);

export default ReduxContainer;
