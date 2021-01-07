import { AppWebsocket } from "@holochain/conductor-api";

let client: any;

const init = async () => {
  if (client) {
    return client;
  }
  try {
    client = await AppWebsocket.connect("ws://localhost:8888");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

interface CallZomeConfig {
  cap: any;
  cell_id: any;
  zome_name: string;
  fn_name: string;
  provenance: any;
  payload: any;
}

export const getAgentId = async () => {
  await init();
  try {
    const info = await client.appInfo({ app_id: "test-app" });
    return info.cell_data[0][0][1];
  } catch (e) {
    console.warn(e);
  }
};

export const callZome = async (config: any) => {
  await init();
  const info = await client.appInfo({ app_id: "test-app" });
  const {
    cap = null,
    cellId = info.cell_data[0][0],
    zomeName,
    fnName,
    provenance = info.cell_data[0][0][1],
    payload = null,
  } = config;
  try {
    return await client.callZome({
      cap: cap,
      cell_id: cellId,
      zome_name: zomeName,
      fn_name: fnName,
      payload,
      provenance,
    });
  } catch (e) {
    console.warn(e);
    return null;
  }
};
