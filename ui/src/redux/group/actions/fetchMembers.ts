import { ThunkAction } from "../../types";
import { fetchUsernameOfMembers } from "./helpers";

const fetchMembers =
  (ids: string[], id: string): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    return await fetchUsernameOfMembers(getState(), ids, callZome, id);
  };

export default fetchMembers;
