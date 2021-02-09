import { applyMiddleware, createStore } from "redux";
import { modifiedThunk } from "./holochain/holochainClient";
import rootReducer from "./reducers";

const store = createStore(rootReducer, applyMiddleware(modifiedThunk));

export default store;
