import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import {
  base64ToUint8Array,
  Uint8ArrayToBase64,
} from "../../../../utils/helpers";
import { Profile } from "../../../profile/types";
import { ThunkAction } from "../../../types";
import { AddGroupAction, ADD_GROUP, GroupConversation } from "../../types";

const addedToGroup = (signalPayload: any): ThunkAction => async (
  dispatch,
  getState,
  { callZome, getAgentId }
) => {
  const { payload } = signalPayload;
  const groupData: GroupConversation = {
    originalGroupEntryHash: Uint8ArrayToBase64(payload.groupId),
    originalGroupHeaderHash: Uint8ArrayToBase64(payload.groupRevisionId),
    name: payload.latestName,
    members: payload.members.map((member: Buffer) =>
      Uint8ArrayToBase64(member)
    ),
    createdAt: payload.created,
    creator: Uint8ArrayToBase64(payload.creator),
    messages: [],
  };

  let contacts = getState().contacts.contacts;
  // At this point, username is non-nullable
  let username = getState().profile.username!;
  let undefinedProfiles: AgentPubKey[] = [];
  let membersUsernames: { [key: string]: Profile } = {};
  let groupMembers = [...groupData.members, groupData.creator];

  // TODO: simplify this
  getAgentId()
    .then((res: any) => Uint8ArrayToBase64(res))
    .then((myAgentIdBase64: any) => {
      // to ensure that the Profile of members (including creator) are available
      groupMembers.forEach((member: any) => {
        if (contacts[member]) {
          membersUsernames[member] = contacts[member];
        } else if (member === myAgentIdBase64) {
          membersUsernames[myAgentIdBase64] = {
            id: myAgentIdBase64,
            username,
          };
        } else {
          undefinedProfiles.push(
            Buffer.from(base64ToUint8Array(member).buffer)
          );
        }
      });
      if (undefinedProfiles?.length) {
        callZome({
          zomeName: ZOMES.USERNAME,
          fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
          payload: undefinedProfiles,
        }).then((res: any) => {
          res.forEach((profile: any) => {
            let base64 = Uint8ArrayToBase64(profile.agentId);
            membersUsernames[base64] = {
              id: base64,
              username: profile.username,
            };
          });
          dispatch<AddGroupAction>({
            type: ADD_GROUP,
            groupData,
            membersUsernames,
          });
        });
      }
    });
};

export default addedToGroup;
