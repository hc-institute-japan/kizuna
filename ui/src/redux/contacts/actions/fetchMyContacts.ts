import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { pushError } from "../../error/actions";
import { AgentProfile, Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { ContactOutput, SET_CONTACTS } from "../types";
import { serializeHash } from "@holochain-open-dev/core-types";

const fetchMyContacts =
  (): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    try {
      const contactOuputs: ContactOutput[] = await callZome({
        zomeName: ZOMES.CONTACTS,
        fnName: FUNCTIONS[ZOMES.CONTACTS].LIST_ADDED,
      });
      const ids = contactOuputs.map((contact) => serializeHash(contact.id));

      let contacts: { [key: string]: Profile } = {};
      try {
        const profilesOutput = await callZome({
          zomeName: ZOMES.PROFILES,
          fnName: FUNCTIONS[ZOMES.PROFILES].GET_AGENTS_PROFILES,
          payload: ids,
        });
        profilesOutput.forEach((agentProfile: AgentProfile) => {
          const id = serializeHash(agentProfile.agentPubKey);
          contacts[id] = {
            id,
            username: agentProfile.profile.nickname,
            fields: agentProfile.profile.fields.avatar
              ? {
                  avatar: agentProfile.profile.fields.avatar,
                }
              : {},
          };
        });
        dispatch({
          type: SET_CONTACTS,
          contacts,
        });
        return contacts;
      } catch (e) {
        dispatch(
          pushError(
            "TOAST",
            {},
            { id: "redux.err.contacts.fetch-my-contacts.1" }
          )
        );
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
    return null;
  };

export default fetchMyContacts;
