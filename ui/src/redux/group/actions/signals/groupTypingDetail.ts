import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { AgentProfile, Profile } from "../../../profile/types";
import { CallZomeConfig, ThunkAction } from "../../../types";
import {
  GroupTypingDetail,
  SetGroupTypingIndicator,
  SET_GROUP_TYPING_INDICATOR,
} from "../../types";

const fetchProfile = async (
  indicatedBy: string,
  callZome: (config: CallZomeConfig) => Promise<any>
) => {
  let fetchedProfile: AgentProfile = await callZome({
    zomeName: ZOMES.PROFILES,
    fnName: FUNCTIONS[ZOMES.PROFILES].GET_AGENT_PROFILE,
    payload: indicatedBy,
  });
  let id = fetchedProfile.agent_pub_key;
  return {
    id: id,
    username: fetchedProfile.profile.nickname,
    fields: fetchedProfile.profile.fields.avatar
      ? { avatar: fetchedProfile.profile.fields.avatar }
      : {},
  };
};

const groupTypingDetail =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    const { payload } = signalPayload;
    const groupIdB64 = serializeHash(payload.groupId);
    const state = getState();
    const groupTyping = state.groups.typing[groupIdB64]
      ? state.groups.typing[groupIdB64]
      : [];
    const { contacts } = state.contacts;
    const memberId = serializeHash(payload.indicatedBy);
    const currTypers = groupTyping.map((profile: Profile) => profile.id);

    /*
    only work with typing signal if needed be.
    Do not work with signal if we already know that the
    typer is typing and the signal is still an indication of typing
    and vice versa.
    */
    if (
      (payload.isTyping && !currTypers.includes(memberId)) ||
      (!payload.isTyping && currTypers.includes(memberId))
    ) {
      let indicatedBy: Profile = contacts[memberId]
        ? contacts[memberId]
        : await fetchProfile(memberId, callZome);
      let GroupTypingDetail: GroupTypingDetail = {
        groupId: groupIdB64,
        indicatedBy: indicatedBy,
        isTyping: payload.isTyping,
      };

      let typing = state.groups.typing;
      let groupTyping = typing[GroupTypingDetail.groupId]
        ? typing[GroupTypingDetail.groupId]
        : [];
      const id = groupTyping.map((profile: Profile) => profile.id);
      if (GroupTypingDetail.isTyping) {
        if (!id.includes(GroupTypingDetail.indicatedBy.id)) {
          groupTyping.push(GroupTypingDetail.indicatedBy);
        }
      } else {
        groupTyping = groupTyping.filter((profile) => {
          return profile.id !== GroupTypingDetail.indicatedBy.id;
        });
      }

      typing = {
        ...typing,
        [GroupTypingDetail.groupId]: groupTyping,
      };

      dispatch<SetGroupTypingIndicator>({
        type: SET_GROUP_TYPING_INDICATOR,
        typing,
      });
    }
  };

export default groupTypingDetail;
