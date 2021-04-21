import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";

import store from "../redux/store";
import { CallZomeConfig } from "../redux/types";
import {
  AddGroupAction,
  ADD_GROUP,
  GroupConversation,
  GroupMessage,
} from "../redux/group/types";
import { SET_GROUP_MESSAGE, SetGroupMessageAction } from "../redux/group/types";
import { base64ToUint8Array, Uint8ArrayToBase64 } from "../utils/helpers";
import { isImage, isOther, isTextPayload } from "../redux/commons/types";
import { Profile } from "../redux/profile/types";
import { FUNCTIONS, ZOMES } from "./types";

let client: null | AppWebsocket = null;

let signalHandler: AppSignalCb = (signal) => {
  switch (signal.data.payload.name) {
    case "added_to_group":
      let payload = signal.data.payload.payload.payload;
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

      let contacts = store.getState().contacts.contacts;
      // At this point, username is non-nullable
      let username = store.getState().profile.username!;
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
              store.dispatch<AddGroupAction>({
                type: ADD_GROUP,
                groupData,
                membersUsernames,
              });
            });
          }
        });
      break;
    case "group_messsage_data": {
      let payload = signal.data.payload.payload.payload;
      let groupMessage: GroupMessage = {
        groupMessageEntryHash: Uint8ArrayToBase64(payload.id),
        groupEntryHash: Uint8ArrayToBase64(payload.content.groupHash),
        author: Uint8ArrayToBase64(payload.content.sender),
        payload: isTextPayload(payload.content.payload)
          ? payload.content.payload
          : {
              type: "FILE",
              fileName: payload.content.payload.payload.metadata.fileName,
              fileSize: payload.content.payload.payload.metadata.fileSize,
              fileType: isOther(payload.content.payload.payload.fileType)
                ? "OTHER"
                : isImage(payload.content.payload.payload.fileType)
                ? "IMAGE"
                : "VIDEO",
              fileHash: Uint8ArrayToBase64(
                payload.content.payload.payload.metadata.fileHash
              ),
              thumbnail: isOther(payload.content.payload.payload.fileType)
                ? undefined
                : payload.content.payload.payload.fileType.payload.thumbnail,
            },
        timestamp: payload.content.created,
        // TODO: work on this
        // replyTo: undefined,
        // TODO: work on this too
        readList: {},
      };
      store.dispatch<SetGroupMessageAction>({
        type: SET_GROUP_MESSAGE,
        groupMessage,
      });
      break;
    }
    default:
      break;
  }
};

const init: () => any = async () => {
  if (client) {
    return client;
  }
  try {
    client = await AppWebsocket.connect(
      process.env.REACT_APP_DNA_INTERFACE_URL as string,
      15000, // holochain's default timeout
      signalHandler
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

let myAgentId: AgentPubKey | null;
// DO NOT USE THIS AS IT IS BUT INSTEAD USE THE fetchId ACTION FROM PROFILE INSTEAD
export const getAgentId: () => Promise<AgentPubKey | null> = async () => {
  if (myAgentId) {
    return myAgentId;
  }
  await init();
  try {
    const info = await client?.appInfo({ installed_app_id: "test-app" });
    if (info?.cell_data[0].cell_id[1]) {
      myAgentId = info?.cell_data[0].cell_id[1];
      return myAgentId;
    }
    return null;
  } catch (e) {
    console.warn(e);
  }
  return null;
};

export const callZome: (config: CallZomeConfig) => Promise<any> = async (
  config
) => {
  await init();

  const info = await client?.appInfo({ installed_app_id: "test-app" });
  const {
    cap = null,
    cellId = info?.cell_data[0].cell_id,
    zomeName,
    fnName,
    provenance = info?.cell_data[0].cell_id[1],
    payload = null,
  } = config;
  try {
    if (cellId && provenance)
      return await client?.callZome({
        cap: cap,
        cell_id: cellId,
        zome_name: zomeName,
        fn_name: fnName,
        payload,
        provenance,
      });
  } catch (e) {
    console.warn(e);
    return e;
  }
};
