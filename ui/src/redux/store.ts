import { AnyAction, applyMiddleware, createStore as create } from "redux";
import logger from "redux-logger";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { callZome, getAgentId } from "../connection/holochainClient";
import rootReducer from "./reducers";
import { RootState } from "./types";

const createStore = (args?: Object) => {
  const modifiedThunk = thunk.withExtraArgument({
    callZome,
    getAgentId,
    ...args,
  });

  return create(
    rootReducer,
    applyMiddleware(
      modifiedThunk as ThunkMiddleware<RootState, AnyAction>
      // logger
    )
  );
};

export default createStore;
