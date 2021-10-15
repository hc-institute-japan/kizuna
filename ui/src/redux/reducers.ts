import { combineReducers } from "redux";
import contactsReducer from "./contacts/reducer";
import groupReducer from "./group/reducer";
import preferenceReducer from "./preference/reducer";
import profileReducer from "./profile/reducer";
import p2pmessagesReducer from "./p2pmessages/reducer";
import languageReducer from "./language/reducer";
import errorReducer from "./error/reducer";
import webrtcReducer from "./webrtc/reducer";

const rootReducer = combineReducers({
  profile: profileReducer,
  contacts: contactsReducer,
  preference: preferenceReducer,
  groups: groupReducer,
  p2pmessages: p2pmessagesReducer,
  language: languageReducer,
  error: errorReducer,
  webrtc: webrtcReducer,
});

export default rootReducer;
