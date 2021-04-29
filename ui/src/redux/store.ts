import { applyMiddleware, createStore } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import { callZome, getAgentId } from "../connection/holochainClient";
import rootReducer from "./reducers";

const modifiedThunk = thunk.withExtraArgument({ callZome, getAgentId });

const store = createStore(
  rootReducer,
  applyMiddleware(
    modifiedThunk
    // logger
  )
);

export default store;
