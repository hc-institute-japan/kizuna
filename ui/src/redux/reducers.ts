import { combineReducers } from "redux";
import profileReducer from "./profile/reducer";
import contactsReducer from "./contacts/reducer";

import preferenceReducer from "./preference/reducer";

const rootReducer = combineReducers({
  profile: profileReducer,
  contacts: contactsReducer,
  preference: preferenceReducer,
});

export default rootReducer;
