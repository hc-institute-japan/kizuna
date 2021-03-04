import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";
import store from "../redux/store";
import { CallZomeConfig } from "../redux/types";
import { ADD_GROUP, GroupConversation } from "../redux/group/types";

let client: null | AppWebsocket = null;
let myAgentId: null | AgentPubKey = null;

let signalHandler: AppSignalCb = (signal) => {
  switch (signal.data.payload.name) {
    case "added_to_group":
      let payload = signal.data.payload.payload.AddedToGroup;
      const groupData: GroupConversation = {
        originalGroupEntryHash: payload.groupId,
        originalGroupHeaderHash: payload.groupRevisionId,
        name: payload.name,
        members: payload.members,
        createdAt: payload.created,
        creator: payload.creator,
        messages: [],
      };
      store.dispatch({
        type: ADD_GROUP,
        groupData,
      });
      break;
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

export const getAgentId: () => Promise<AgentPubKey | undefined> = async () => {
  if (myAgentId) {
    return myAgentId;
  }
  await init();
  try {
    const info = await client?.appInfo({ installed_app_id: "test-app" });
    return info?.cell_data[0][0][1];
  } catch (e) {
    console.warn(e);
  }
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
