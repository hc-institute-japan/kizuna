import { combineReducers } from "redux";
import profileReducer from "./profile/reducer";
import contactsReducer from "./contacts/reducer";
import groupReducer from "./group/reducer";
import preferenceReducer from "./preference/reducer";

const rootReducer = combineReducers({
  profile: profileReducer,
  contacts: contactsReducer,
  preference: preferenceReducer,
  groups: groupReducer,
});

export default rootReducer;
