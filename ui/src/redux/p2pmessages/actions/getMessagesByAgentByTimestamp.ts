import { deserializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../../redux/error/actions";
import { dateToTimestamp } from "../../../utils/helpers";
import { transformZomeDataToUIData } from "./helpers/transformZomeDateToUIData";

export const getMessagesByAgentByTimestamp =
  (id: string, date: Date, payload_type: String): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let zome_input = {
      conversant: deserializeHash(id),
      date: dateToTimestamp(date),
      payload_type: payload_type,
    };

    try {
      const messagesByDate = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_MESSAGES_BY_AGENT_BY_TIMESTAMP,
        payload: zome_input,
      });

      if (messagesByDate?.type !== "error") {
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
        let transformed = transformZomeDataToUIData(
          messagesByDate,
          profileList
        );
        return transformed;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
