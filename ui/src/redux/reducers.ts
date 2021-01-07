import { combineReducers } from "redux";
import ProfileReducer from "./profile/reducer";

const rootReducer = combineReducers({ profile: ProfileReducer });

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
