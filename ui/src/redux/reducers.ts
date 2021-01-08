import { combineReducers } from "redux";
import ProfileReducer from "./profile/reducer";
import ContactsReducer from './contacts/reducer'

const rootReducer = combineReducers({ profile: ProfileReducer, contacts: ContactsReducer });

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
