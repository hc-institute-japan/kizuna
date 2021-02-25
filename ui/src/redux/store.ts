import { applyMiddleware, createStore } from "redux";
import rootReducer from "./reducers";
import { callZome, getAgentId } from "../connection/holochainClient";
import thunk from "redux-thunk";

const modifiedThunk = thunk.withExtraArgument({ callZome, getAgentId });

const store = createStore(rootReducer, applyMiddleware(modifiedThunk));

export default store;
