import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { Uint8ArrayToBase64 } from "../../../../utils/helpers";
import { Profile } from "../../../profile/types";
import { ThunkAction } from "../../../types";
import {
  GroupTypingDetail,
  SetGroupTyingIndicator,
  SET_GROUP_TYPING_INDICATOR,
} from "../../types";

const groupTypingDetail = (signalPayload: any): ThunkAction => async (
  dispatch,
  getState,
  { getAgentId, callZome }
) => {
  const { payload } = signalPayload;
  let contacts = getState().contacts.contacts;
  let indicatedBy: Profile;
  let undefinedProfiles: AgentPubKey[] = [];

  getAgentId()
    .then((res: any) => Uint8ArrayToBase64(res))
    .then((myAgentIdBase64: any) => {
      let memberId = Uint8ArrayToBase64(payload.indicatedBy);
      if (contacts[memberId] && contacts[memberId].id !== myAgentIdBase64) {
        indicatedBy = contacts[memberId];
      } else if (memberId === myAgentIdBase64) {
      } else {
        undefinedProfiles.push(payload.indicatedBy);
      }
      if (undefinedProfiles?.length) {
        callZome({
          zomeName: ZOMES.USERNAME,
          fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
          payload: undefinedProfiles,
        }).then((res: any) => {
          res.forEach((profile: any) => {
            let base64 = Uint8ArrayToBase64(profile.agentId);
            indicatedBy = {
              id: base64,
              username: profile.username,
            };
          });

          let GroupTypingDetail: GroupTypingDetail = {
            groupId: Uint8ArrayToBase64(payload.groupId),
            indicatedBy: indicatedBy,
            isTyping: payload.isTyping,
          };
          dispatch<SetGroupTyingIndicator>({
            type: SET_GROUP_TYPING_INDICATOR,
            GroupTyingIndicator: GroupTypingDetail,
          });
        });
      } else if (indicatedBy) {
        let GroupTypingDetail: GroupTypingDetail = {
          groupId: Uint8ArrayToBase64(payload.groupId),
          indicatedBy: indicatedBy,
          isTyping: payload.isTyping,
        };
        dispatch<SetGroupTyingIndicator>({
          type: SET_GROUP_TYPING_INDICATOR,
          GroupTyingIndicator: GroupTypingDetail,
        });
      }
    });
};

export default groupTypingDetail;
