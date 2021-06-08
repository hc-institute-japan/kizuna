import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import createStore from "../redux/store";
import { useError } from "./ErrorContainer/context";

export let store: Store | undefined;

const ReduxContainer: React.FC = ({ children }) => {
  const [isStoreReady, setIsStoreReady] = useState(false);
  const { displayError } = useError();

  useEffect(function () {
    store = createStore({ displayError });
    setIsStoreReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isStoreReady ? (
    <Provider store={store as Store}>{children}</Provider>
  ) : null;
};

export default ReduxContainer;
