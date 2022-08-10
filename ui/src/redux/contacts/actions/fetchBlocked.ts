import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { pushError } from "../../error/actions";
import { Profile, ProfileRaw } from "../../profile/types";
import { ThunkAction } from "../../types";
import { ContactOutput, SET_BLOCKED } from "../types";
import { serializeHash } from "@holochain-open-dev/core-types";
import { getEntryFromRecord } from "../../../utils/services/HolochainService";
import { decode } from "@msgpack/msgpack";

const fetchBlocked =
  (): ThunkAction =>
  async (dispatch, _, { callZome }) => {
    try {
      const contactOutputs: ContactOutput[] = await callZome({
        zomeName: ZOMES.CONTACTS,
        fnName: FUNCTIONS[ZOMES.CONTACTS].LIST_BLOCKED,
      });
      const idsB64 = contactOutputs.map((contact) => serializeHash(contact.id));

      let blocked: { [key: string]: Profile } = {};
      try {
        const res: [] = await callZome({
          zomeName: ZOMES.PROFILES,
          fnName: FUNCTIONS[ZOMES.PROFILES].GET_AGENTS_PROFILES,
          payload: idsB64,
        });

        res.forEach((rec: any) => {
          const raw = decode(getEntryFromRecord(rec)) as ProfileRaw;
          const id = serializeHash(rec.signed_action.Create.author);
          blocked[id] = {
            id,
            username: raw.nickname,
            fields: raw.fields.avatar ? { avatar: raw.fields.avatar } : {},
          };
        });
        dispatch({
          type: SET_BLOCKED,
          blocked,
        });
        return blocked;
      } catch (e) {
        if (
          (e as any).message.includes(
            "Failed to get the username for this agent"
          )
        )
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.contacts.fetch-blocked.1" })
          );
        else if (
          (e as any).message.includes("No username for this agent exists")
        )
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.contacts.fetch-blocked.2" })
          );
        else dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
    return null;
  };

export default fetchBlocked;
