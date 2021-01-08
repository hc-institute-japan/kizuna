import { Profile, ThunkAction } from "../../utils/types";
import { SET_CONTACTS } from "./types";

export const setContacts = (contacts: Profile[]): ThunkAction => (dispatch) =>
  dispatch({
    type: SET_CONTACTS,
    contacts,
  });
