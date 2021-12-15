import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../../redux/error/actions";
import { transformZomeDataToUIData } from "./helpers/transformZomeDateToUIData";
import { BatchSize } from "../types";
import { setMessages } from "../actions/setMessages";

/* 
    get the latest messages 
    when the application starts, is refreshed
*/
export const getLatestMessages =
  (size: number): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    try {
      // CALL ZOME
      const batchSize: BatchSize = size;
      const p2pLatestState = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
        payload: batchSize,
      });

      // DISPATCH TO REDUCER
      if (p2pLatestState?.type !== "error") {
        const contactsState = { ...getState().contacts.contacts };
        const profile = { ...getState().profile };
        const profileList = {
          ...contactsState,
          [profile.id!]: {
            id: profile.id!,
            username: profile.username!,
            fields: profile.fields,
          },
        };
        let toDispatch = transformZomeDataToUIData(p2pLatestState, profileList);
        dispatch(setMessages(toDispatch));

        return toDispatch;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
