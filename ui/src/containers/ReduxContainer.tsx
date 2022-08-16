import React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import createStore from "../redux/store";

const RedeclaredProvider = Provider as any;

export let store: Store | undefined;
store = createStore();

const ReduxContainer: React.FC = ({ children }) => (
  <RedeclaredProvider store={store as Store}>{children}</RedeclaredProvider>
);

export default ReduxContainer;
