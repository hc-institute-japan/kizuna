import { serializeHash } from "@holochain-open-dev/core-types";
import { AgentPubKey } from "@holochain/client";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../../utils/services/HolochainService/types";
import { deserializeAgentPubKey } from "../../../../utils/services/ConversionService";
import { timestampToDate } from "../../../../utils/services/DateService";
import { Profile, ProfileRaw } from "../../../profile/types";
import { ThunkAction } from "../../../types";
import { AddGroupAction, ADD_GROUP, GroupConversation } from "../../types";
import { getEntryFromRecord } from "../../../../utils/services/HolochainService";
import { decode } from "@msgpack/msgpack";

const addedToGroup =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    const { payload } = signalPayload;

    const state = getState();
    const contacts = state.contacts.contacts;
    const { username, fields } = state.profile; // At this point, username is non-nullable
    // const id = await getAgentId();
    // const myAgentId = serializeHash(id!); // AgentPubKey should be non-nullable here
    const myAgentId = getState().profile.id!;

    const groupData: GroupConversation = {
      originalGroupId: serializeHash(payload.groupId),
      originalGroupRevisionId: serializeHash(payload.groupRevisionId),
      name: payload.latestName,
      members: payload.members.map((member: Buffer) => serializeHash(member)),
      createdAt: timestampToDate(payload.created),
      creator: serializeHash(payload.creator),
      /* 
          Messages are empty at the creation of group
          This creates a tad bit of delay in rendering group in Conversations page
          as group conversation is created first and then the first message
          arrives with signal
        */
      messages: [],
      pinnedMessages: [],
      avatar: payload.avatar,
    };

    /* 
      Attempt to get the profile of group members from own contacts list.
      If not found from contacts nor own AgentPubKey, then push it to
      undefinedProfiles
      */
    const groupMembers = [...groupData.members, groupData.creator];
    const membersProfile: { [key: string]: Profile } = {};
    const nonAddedProfiles: AgentPubKey[] = groupMembers.reduce(
      (res, member: any) => {
        const memberProfile: Profile | null = contacts[member]
          ? contacts[member]
          : member === myAgentId
          ? {
              id: myAgentId,
              username: username!,
              fields,
            }
          : null;
        if (memberProfile) {
          membersProfile[member] = memberProfile;
        } else {
          const pubkey = deserializeAgentPubKey(member);
          res.push(pubkey);
        }
        return res;
      },
      [] as AgentPubKey[]
    );

    // get the profiles not in contacts from HC
    // TODO: change for profiles module
    if (nonAddedProfiles?.length) {
      const res: [] = await callZome({
        zomeName: ZOMES.PROFILES,
        fnName: FUNCTIONS[ZOMES.PROFILES].GET_AGENTS_PROFILES,
        payload: nonAddedProfiles,
      });
      res.forEach((rec: any) => {
        const raw = decode(getEntryFromRecord(rec)) as ProfileRaw;
        const id = serializeHash(rec.signed_action.Create.author);
        membersProfile[id] = {
          id,
          username: raw.nickname,
          fields: raw.fields.avatar ? { avatar: raw.fields.avatar } : {},
        };
      });
    }

    let groupEntryHash: string = groupData.originalGroupId;
    let newConversation: { [key: string]: GroupConversation } = {
      [groupEntryHash]: groupData,
    };
    let conversations = state.groups.conversations;
    conversations = {
      ...conversations,
      ...newConversation,
    };
    let members = state.groups.members;
    members = {
      ...members,
      ...membersProfile,
    };
    dispatch<AddGroupAction>({
      type: ADD_GROUP,
      conversations,
      members,
    });
  };

export default addedToGroup;
