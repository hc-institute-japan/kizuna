import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { AgentProfile, Profile } from "../../../profile/types";
import { CallZomeConfig, ThunkAction } from "../../../types";
import {
  SetGroupTypingIndicator,
  SET_GROUP_TYPING_INDICATOR,
} from "../../types";

interface PayloadType {
  groupId: Uint8Array;
  indicatedBy: Uint8Array;
  members: Uint8Array[];
  isTyping: boolean;
}

const fetchProfile = async (
  indicatedBy: string,
  callZome: (config: CallZomeConfig) => Promise<any>
) => {
  const fetchedProfile: AgentProfile = await callZome({
    zomeName: ZOMES.PROFILES,
    fnName: FUNCTIONS[ZOMES.PROFILES].GET_AGENT_PROFILE,
    payload: indicatedBy,
  });
  const id = fetchedProfile.agent_pub_key;
  return {
    id,
    username: fetchedProfile.profile.nickname,
    fields: fetchedProfile.profile.fields.avatar
      ? { avatar: fetchedProfile.profile.fields.avatar }
      : {},
  };
};

const groupTypingDetail =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const { groupId, indicatedBy, isTyping }: PayloadType =
      signalPayload.payload;
    const memberId = serializeHash(indicatedBy);
    const { typing = {}, contact = await fetchProfile(memberId, callZome) } = {
      typing: getState().groups.typing,
      contact: getState().contacts.contacts[memberId],
    };
    const groupIdB64 = serializeHash(groupId);
    const groupTyping = typing[groupIdB64] ? typing[groupIdB64] : [];
    const currTypers = groupTyping.map((profile: Profile) => profile.id);

    /*
    only work with typing signal if needed be.
    Do not work with signal if we already know that the
    typer is typing and the signal is still an indication of typing
    and vice versa.
    */

    if (isTyping !== currTypers.includes(memberId))
      dispatch<SetGroupTypingIndicator>({
        type: SET_GROUP_TYPING_INDICATOR,
        typing: {
          ...typing,
          [groupIdB64]: isTyping
            ? [...groupTyping, contact]
            : groupTyping.filter((profile) => profile.id !== contact.id),
        },
      });
  };

export default groupTypingDetail;
