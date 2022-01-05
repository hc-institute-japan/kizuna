import { serializeHash } from "@holochain-open-dev/core-types";
import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import {
  deserializeAgentPubKey,
  objectMap,
  timestampToDate,
} from "../../../../utils/helpers";
import {
  isOther,
  // type guards
  isTextPayload,
  Payload,
  TextPayload,
} from "../../../commons/types";
import { AgentProfile, Profile } from "../../../profile/types";
import { CallZomeConfig, RootState } from "../../../types";
import {
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
      message_ids.map((message_id) => serializeHash(message_id))
  );

  const groupMessagesContents: GroupMessagesContents = objectMap(
    fetchedRes.groupMessagesContents,
    (msg_content): GroupMessage => {
      const convertedReadList: {
        [key: string]: Date;
      } = objectMap(
        msg_content.readList,
        (timestamp): Date => timestampToDate(timestamp)
      );

      return {
        groupMessageId: serializeHash(
          msg_content.groupMessageElement.signedHeader.header.content.entry_hash
        ),
        groupId: serializeHash(msg_content.groupMessageElement.entry.groupHash),
        author: serializeHash(msg_content.groupMessageElement.entry.sender),
        payload: convertPayload(msg_content.groupMessageElement.entry.payload),
        timestamp: timestampToDate(
          msg_content.groupMessageElement.entry.created
        ),
        replyTo: msg_content.groupMessageElement.entry.replyTo
          ? {
              groupId: serializeHash(
                msg_content.groupMessageElement.entry.replyTo.content.groupHash
              ),
              author: serializeHash(
                msg_content.groupMessageElement.entry.replyTo.content.sender
              ),
              payload: convertPayload(
                msg_content.groupMessageElement.entry.replyTo.content.payload
              ),
              timestamp: timestampToDate(
                msg_content.groupMessageElement.entry.replyTo.content.created
              ),

              replyTo: msg_content.groupMessageElement.entry.replyTo
                ? serializeHash(msg_content.groupMessageElement.entry.replyTo)
                : undefined,
              readList: {},
            }
          : undefined,
        readList: convertedReadList,
      };
    }
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
      fileHash: serializeHash(payload.payload.metadata.fileHash),
    };
  } else {
    return {
      type: "FILE",
      fileName: payload.payload.metadata.fileName,
      fileSize: payload.payload.metadata.fileSize,
      fileType: payload.payload.metadata.fileType,
      fileHash: serializeHash(payload.payload.metadata.fileHash),
      thumbnail: payload.payload.fileType.payload.thumbnail,
    };
  }
};

export const fetchUsernameOfMembers = async (
  state: RootState,
  members: string[],
  callZome: (config: CallZomeConfig) => Promise<any>,
  myAgentId: string
) => {
  const contacts = state.contacts.contacts;
  // can assume that this is non-nullable since agent cannot call this
  // function without having a username.
  const myProfile = state.profile;

  let undefinedProfiles: AgentPubKey[] = [];
  let membersUsernames: { [key: string]: Profile } = {};

  members.forEach((member) => {
    if (contacts[member]) {
      membersUsernames[member] = contacts[member];
    } else if (member === myAgentId) {
      membersUsernames[myAgentId] = {
        id: myAgentId,
        username: myProfile.username!,
        fields: myProfile.fields,
      };
    } else {
      undefinedProfiles.push(deserializeAgentPubKey(member));
    }
  });

  if (undefinedProfiles?.length) {
    const undefinedProfilesB64 = undefinedProfiles.map((undefinedProfile) =>
      serializeHash(undefinedProfile)
    );
    const res = await callZome({
      zomeName: ZOMES.PROFILES,
      fnName: FUNCTIONS[ZOMES.PROFILES].GET_AGENTS_PROFILES,
      payload: undefinedProfilesB64,
    });
    res.forEach((agentProfile: AgentProfile) => {
      let id = agentProfile.agent_pub_key;
      membersUsernames[id] = {
        id,
        username: agentProfile.profile.nickname,
        fields: agentProfile.profile.fields.avatar
          ? {
              avatar: agentProfile.profile.fields.avatar,
            }
          : {},
      };
    });
  }

  return membersUsernames;
};
