import { AnyAction, applyMiddleware, createStore } from "redux";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { callZome, getAgentId } from "../connection/holochainClient";
import rootReducer from "./reducers";
import { RootState } from "./types";

const modifiedThunk = thunk.withExtraArgument({ callZome, getAgentId });

const store = createStore(
  rootReducer,
  applyMiddleware(
    modifiedThunk as ThunkMiddleware<RootState, AnyAction>
    // logger
  )
);

export default store;
