import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { Profile } from "../../../profile/types";
import { CallZomeConfig, ThunkAction } from "../../../types";
import {
  GroupTypingDetail,
  SetGroupTyingIndicator,
  SET_GROUP_TYPING_INDICATOR,
} from "../../types";

const fetchProfile = async (
  indicatedBy: any,
  callZome: (config: CallZomeConfig) => Promise<any>
) => {
  /*
    This is only plural because the ZomeFn returns a vector.
    But in reality, only one profile (temporarily username) will be fetched given the arg.
  */
  let fetchedProfiles = await callZome({
    zomeName: ZOMES.USERNAME,
    fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
    payload: [indicatedBy],
  });
  let typerProfile = fetchedProfiles[0]; // safe to access index here because of above assumption
  let base64 = serializeHash(typerProfile.agentId);
  return {
    id: base64,
    username: typerProfile.username,
  };
};

const groupTypingDetail =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState, { getAgentId, callZome }) => {
    const { payload } = signalPayload;
    const state = getState();
    let contacts = state.contacts.contacts;
    let memberId = serializeHash(payload.indicatedBy);
    let indicatedBy: Profile = contacts[memberId]
      ? contacts[memberId]
      : await fetchProfile(payload.indicatedBy, callZome);
    let GroupTypingDetail: GroupTypingDetail = {
      groupId: serializeHash(payload.groupId),
      indicatedBy: indicatedBy,
      isTyping: payload.isTyping,
    };
    dispatch<SetGroupTyingIndicator>({
      type: SET_GROUP_TYPING_INDICATOR,
      GroupTyingIndicator: GroupTypingDetail,
    });
  };

export default groupTypingDetail;
