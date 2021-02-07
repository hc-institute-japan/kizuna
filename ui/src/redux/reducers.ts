import { combineReducers } from "redux";
import profileReducer from "./profile/reducer";
import contactsReducer from "./contacts/reducer";
import signalReducer from "./signal/reducer";
import preferenceReducer from "./preference/reducer";

const rootReducer = combineReducers({
  profile: profileReducer,
  contacts: contactsReducer,
  preference: preferenceReducer,
  signal: signalReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
