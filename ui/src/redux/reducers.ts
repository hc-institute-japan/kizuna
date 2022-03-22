import { combineReducers } from "redux";
import contactsReducer from "./contacts/reducer";
import groupReducer from "./group/reducer";
import preferenceReducer from "./preference/reducer";
import profileReducer from "./profile/reducer";
import p2pmessagesReducer from "./p2pmessages/reducer";
import languageReducer from "./language/reducer";
import errorReducer from "./error/reducer";
import gifReducer from "./gif/reducer";
import conductorReducer from "./conductor/reducer";

const rootReducer = combineReducers({
  conductor: conductorReducer,
  profile: profileReducer,
  contacts: contactsReducer,
  preference: preferenceReducer,
  groups: groupReducer,
  p2pmessages: p2pmessagesReducer,
  language: languageReducer,
  error: errorReducer,
  gif: gifReducer,
});

export default rootReducer;
