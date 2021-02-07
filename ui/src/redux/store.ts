import { AgentPubKey, AppSignal, AppWebsocket } from "@holochain/conductor-api";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { CallZomeConfig } from "../utils/types";
import rootReducer from "./reducers";
import { SET_SIGNAL } from "./signal/types";

let client: null | AppWebsocket = null;

const init: () => any = async () => {
  if (client) {
    return client;
  }
  try {
    client = await AppWebsocket.connect(
      "ws://localhost:8888",
      4000,
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

const modifiedThunk = thunk.withExtraArgument({ callZome, getAgentId });

const store = createStore(rootReducer, applyMiddleware(modifiedThunk));

export default store;
