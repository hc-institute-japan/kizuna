import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";
import { Uint8ArrayToBase64 } from "../utils/helpers";
import { SET_ID } from "../redux/profile/types";
import store from "../redux/store";
import { CallZomeConfig } from "../redux/types";
import { ADD_GROUP, GroupConversation } from "../redux/group/types";

let client: null | AppWebsocket = null;

let signalHandler: AppSignalCb = (signal) => {
  switch (signal.data.payload.name) {
    case "added_to_group":
      let payload = signal.data.payload.payload.payload;
      const groupData: GroupConversation = {
        originalGroupEntryHash: Uint8ArrayToBase64(payload.groupId),
        originalGroupHeaderHash: Uint8ArrayToBase64(payload.groupRevisionId),
        name: payload.name,
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
  let myAgentId = store.getState().profile.id;
  if (myAgentId) {
    return myAgentId;
  }
  await init();
  try {
    const info = await client?.appInfo({ installed_app_id: "test-app" });
    store.dispatch({
      type: SET_ID,
      id: info?.cell_data[0][0][1],
    });
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
