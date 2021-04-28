import { applyMiddleware, createStore } from "redux";
import logger from "redux-logger";
import rootReducer from "./reducers";
import { callZome, getAgentId } from "../connection/holochainClient";
import thunk from "redux-thunk";
import logger from "redux-logger";

const modifiedThunk = thunk.withExtraArgument({ callZome, getAgentId });

const store = createStore(rootReducer, applyMiddleware(modifiedThunk, logger));

export default store;
