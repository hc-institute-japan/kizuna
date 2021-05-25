import { AgentPubKey } from "@holochain/conductor-api";
import { CombinedState } from "redux";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import {
  base64ToUint8Array,
  objectMap,
  Uint8ArrayToBase64,
} from "../../../../utils/helpers";
import {
  Payload,
  TextPayload,
  // type guards
  isTextPayload,
  isOther,
} from "../../../commons/types";
import { ContactsState } from "../../../contacts/types";
import { PreferenceState } from "../../../preference/types";
import { Profile, ProfileState } from "../../../profile/types";
import { CallZomeConfig } from "../../../types";
import {
  GroupConversationsState,
  GroupMessage,
  GroupMessagesContents,
  GroupMessagesOutput,
  MessagesByGroup,
} from "../../types";

// helper function
export const convertFetchedResToGroupMessagesOutput = (
  fetchedRes: any
): GroupMessagesOutput => {
  let messagesByGroup: MessagesByGroup = objectMap(
    fetchedRes.messagesByGroup,
    (message_ids: Uint8Array[]): string[] =>
      message_ids.map((message_id) => Uint8ArrayToBase64(message_id)),
    (group_id: string) => group_id.substring(1)
  );

  let groupMessagesContents: GroupMessagesContents = objectMap(
    fetchedRes.groupMessagesContents,
    (msg_content): GroupMessage => {
      return {
        groupMessageEntryHash: Uint8ArrayToBase64(
          msg_content.groupMessageElement.signedHeader.header.content.entry_hash
        ),
        groupEntryHash: Uint8ArrayToBase64(
          msg_content.groupMessageElement.entry.groupHash
        ),
        author: Uint8ArrayToBase64(
          msg_content.groupMessageElement.entry.sender
        ),
        payload: convertPayload(msg_content.groupMessageElement.entry.payload),
        timestamp: msg_content.groupMessageElement.entry.created,
        replyTo: msg_content.groupMessageElement.entry.replyTo,
        readList: msg_content.readList,
      };
    },
    (group_id: string) => group_id.substring(1)
  );

  let groupMessagesOutput: GroupMessagesOutput = {
    messagesByGroup,
    groupMessagesContents,
  };

  return groupMessagesOutput;
};

export const convertPayload = (payload: any | TextPayload): Payload => {
  if (isTextPayload(payload)) return payload;
  if (isOther(payload.payload.fileType)) {
    return {
      type: "FILE",
      fileName: payload.payload.metadata.fileName,
      fileSize: payload.payload.metadata.fileSize,
      fileType: payload.payload.metadata.fileType,
      fileHash: Uint8ArrayToBase64(payload.payload.metadata.fileHash),
    };
  } else {
    return {
      type: "FILE",
      fileName: payload.payload.metadata.fileName,
      fileSize: payload.payload.metadata.fileSize,
      fileType: payload.payload.metadata.fileType,
      fileHash: Uint8ArrayToBase64(payload.payload.metadata.fileHash),
      thumbnail: payload.payload.fileType.payload.thumbnail,
    };
  }
};

export const fetchUsernameOfMembers = async (
  state: CombinedState<{
    profile: ProfileState;
    contacts: ContactsState;
    preference: PreferenceState;
    groups: GroupConversationsState;
  }>,
  members: string[],
  callZome: (config: CallZomeConfig) => Promise<any>,
  myAgentId: string
) => {
  let contacts = state.contacts.contacts;
  // can assume that this is non-nullable since agent cannot call this
  // function without having a username.
  let username = state.profile.username!;
  let undefinedProfiles: AgentPubKey[] = [];

  let membersUsernames: { [key: string]: Profile } = {};
  members.forEach((member) => {
    if (contacts[member]) {
      membersUsernames[member] = contacts[member];
    } else if (member === myAgentId) {
      membersUsernames[myAgentId] = {
        id: myAgentId,
        username,
      };
    } else {
      undefinedProfiles.push(Buffer.from(base64ToUint8Array(member).buffer));
    }
  });

  if (undefinedProfiles?.length) {
    const res = await callZome({
      zomeName: ZOMES.USERNAME,
      fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
      payload: undefinedProfiles,
    });
    res.forEach((profile: any) => {
      let base64 = Uint8ArrayToBase64(profile.agentId);
      membersUsernames[base64] = { id: base64, username: profile.username };
    });
  }

  return membersUsernames;
};
