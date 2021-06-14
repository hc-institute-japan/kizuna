import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { SET_CONTACTS } from "../types";

const setContacts =
  (contacts: { [key: string]: Profile }): ThunkAction =>
  (dispatch) =>
    dispatch({
      type: SET_CONTACTS,
      contacts,
    });

export default setContacts;
