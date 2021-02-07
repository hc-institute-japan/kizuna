import { combineReducers } from "redux";
import profileReducer from "./profile/reducer";
import contactsReducer from "./contacts/reducer";
import signalReducer from "./signal/reducer";

const rootReducer = combineReducers({
  profile: profileReducer,
  contacts: contactsReducer,
  signal: signalReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
