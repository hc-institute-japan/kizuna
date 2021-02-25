import { AppWebsocket, AppSignal, AgentPubKey } from "@holochain/conductor-api";
import thunk from "redux-thunk";
import { CallZomeConfig } from "../types";
import { SET_SIGNAL } from "../signal/types";
import store from "../store";

let client: null | AppWebsocket = null;
let myAgentId: null | AgentPubKey = null;

const init: () => any = async () => {
  if (client) {
    return client;
  }
  try {
    client = await AppWebsocket.connect(
      "ws://localhost:8888",
      15000, // holochain's default timeout
      (signal: AppSignal) =>
        store.dispatch({
          type: SET_SIGNAL,
          signal,
        })
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

export const modifiedThunk = thunk.withExtraArgument({ callZome, getAgentId });
