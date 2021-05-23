import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { Profile } from "../../../profile/types";
import { ThunkAction } from "../../../types";
import { AddGroupAction, ADD_GROUP, GroupConversation } from "../../types";
import {
  base64ToUint8Array,
  Uint8ArrayToBase64,
} from "../../../../utils/helpers";

const addedToGroup =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    const { payload } = signalPayload;
    const state = getState();
    let contacts = state.contacts.contacts;
    let username = state.profile.username!; // At this point, username is non-nullable
    let myAgentId = await getAgentId();
    let myAgentIdBase64 = Uint8ArrayToBase64(myAgentId!); // AgentPubKey should be non-nullable here

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

    let groupMembers = [...groupData.members, groupData.creator];

    let nonAddedProfiles: AgentPubKey[] = [];
    let membersProfile: { [key: string]: Profile } = {};
    /* 
      Attempt to get the profile of group members from own contacts list.
      If not found from contacts nor own AgentPubKey, then push it to
      undefinedProfiles
    */
    groupMembers.forEach((member: any) => {
      let memberProfile: Profile | null = contacts[member]
        ? contacts[member]
        : member === myAgentIdBase64
        ? {
            id: myAgentIdBase64,
            username,
          }
        : null;
      if (memberProfile) {
        membersProfile[member] = memberProfile;
      } else {
        nonAddedProfiles.push(Buffer.from(base64ToUint8Array(member).buffer));
      }
    });

    // get the profiles not in contacts from HC
    if (nonAddedProfiles?.length) {
      let profiles = await callZome({
        zomeName: ZOMES.USERNAME,
        fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
        payload: nonAddedProfiles,
      });
      profiles.forEach((profile: any) => {
        let base64 = Uint8ArrayToBase64(profile.agentId);
        membersProfile[base64] = {
          id: base64,
          username: profile.username,
        };
      });
    }
    dispatch<AddGroupAction>({
      type: ADD_GROUP,
      groupData,
      membersProfile,
    });
  };

export default addedToGroup;
