import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";
import { handleSignal } from "../redux/signal/actions";
import store from "../redux/store";
import { CallZomeConfig } from "../redux/types";

let client: null | AppWebsocket = null;

let signalHandler: AppSignalCb = (signal) =>
  store.dispatch(
    handleSignal(signal.data.payload.name, signal.data.payload.payload)
  );

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

/* DO NOT USE THIS AS IT IS BUT INSTEAD USE THE getAgentId() ACTION FROM PROFILE INSTEAD */
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
    if (cellId && provenance) {
      return await client?.callZome({
        cap: cap,
        cell_id: cellId,
        zome_name: zomeName,
        fn_name: fnName,
        payload,
        provenance,
      });
    }
  } catch (e) {
    console.warn(e);
    return e;
  }
};
