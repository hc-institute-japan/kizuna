import { AnyAction, applyMiddleware, createStore as create } from "redux";
import thunk, { ThunkMiddleware } from "redux-thunk";
import {
  callZome,
  client,
  getAgentId,
  init,
  retry,
} from "../connection/holochainClient";
import rootReducer from "./reducers";
import { RootState } from "./types";

const createStore = (args?: Object) => {
  const modifiedThunk = thunk.withExtraArgument({
    callZome,
    getAgentId,
    retry,
    client,
    init,
    ...args,
  });

  return create(
    rootReducer,
    applyMiddleware(modifiedThunk as ThunkMiddleware<RootState, AnyAction>)
  );
};

export default createStore;
