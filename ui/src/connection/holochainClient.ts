import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";

import store from "../redux/store";
import { CallZomeConfig } from "../redux/types";
import {
  ADD_GROUP,
  GroupConversation,
  GroupMessage,
} from "../redux/group/types";
import { SET_GROUP_MESSAGE, SetGroupMessageAction } from "../redux/group/types";
import { Uint8ArrayToBase64 } from "../utils/helpers";
import { isTextPayload } from "../redux/commons/types";

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
      store.dispatch({
        type: ADD_GROUP,
        groupData,
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
              type: "TEXT",
              payload: {
                // TODO: work on files
                payload: "This is a placeholder",
              },
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
    if (info?.cell_data[0][0][1]) {
      myAgentId = info?.cell_data[0][0][1];
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
    cellId = info?.cell_data[0][0],
    zomeName,
    fnName,
    provenance = info?.cell_data[0][0][1],
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
