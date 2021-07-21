import { HolochainClient, HoloClient } from "@holochain-open-dev/cell-client";
import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";
import { store } from "../containers/ReduxContainer";
import { handleSignal } from "../redux/signal/actions";
import { CallZomeConfig } from "../redux/types";
// @ts-ignore
global.COMB = undefined;
// @ts-ignore
const { Connection } = require("@holo-host/web-sdk");
// @ts-ignore
window.COMB = require("@holo-host/comb").COMB;

let client: null | HolochainClient | HoloClient = null;

let signalHandler: AppSignalCb = (signal) =>
  store?.dispatch(
    handleSignal(signal.data.payload.name, signal.data.payload.payload)
  );

const createClient = async (
  env: string
): Promise<HoloClient | HolochainClient | null> => {
  switch (env) {
    case "HCC": {
      const branding = {
        app_name: "kizuna_test",
      };

      const connection = new Connection(
        `http://localhost:${process.env.REACT_APP_CHAPERONE_PORT}`,
        // "http://localhost:24273",
        signalHandler,
        branding
      );

      await connection.ready();

      await connection.signIn();

      const appInfo = await connection.appInfo(process.env.REACT_APP_APP_ID);

      const cellData = appInfo.cell_data[0];

      return new HoloClient(connection, cellData, branding);
    }
    case "HC": {
      const appWs = await AppWebsocket.connect(
        process.env.REACT_APP_DNA_INTERFACE_URL as string,
        15000, // holochain's default timeout
        signalHandler
      );

      const appInfo = await appWs.appInfo({
        installed_app_id: "test-app",
      });

      const cellData = appInfo.cell_data[0];

      return new HolochainClient(appWs, cellData);
    }
    default: {
      return null;
    }
  }
};

const init: () => any = async () => {
  if (client) {
    return client;
  }
  try {
    client = await createClient(process.env.REACT_APP_ENV as string);
    return client;

    // const branding = {
    //   app_name: "kizuna_test",
    // };

    // const connection = new Connection(
    //   "http://localhost:24273",
    //   signalHandler,
    //   branding
    // );

    // await connection.ready();

    // await connection.signIn();

    // const appInfo = await connection.appInfo(
    //   "uhCkkHSLbocQFSn5hKAVFc_L34ssLD52E37kq6Gw9O3vklQ3Jv7eL"
    // );

    // const cellData = appInfo.cell_data[0];

    // client = new HoloClient(connection, cellData, branding);
  } catch (error) {
    Object.values(error).forEach((e) => console.error(e));
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
    const info = await client?.cellId[1];

    if (info) {
      return info;
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

  const {
    // cellId = info?.cell_data[0].cell_id,
    zomeName,
    fnName,
    // provenance = info?.cell_data[0].cell_id[1],
    payload = null,
  } = config;
  try {
    return await client?.callZome(zomeName, fnName, payload);
  } catch (e) {
    console.warn(e);
    const { type = null, data = null } = { ...e };
    if (type === "error") {
      console.warn(fnName);
      switch (data?.type) {
        case "ribosome_error": {
          const regex = /Guest\("([\s\S]*?)"\)/;
          const result = regex.exec(data.data);
          throw {
            type: "error",
            function: fnName,
            message: result ? result[1] : "Something went wrong",
          };
        }
        case "internal_error": {
          /*
            temporarily throwing a custom error for any internal_error
            until we have a better grasp of how to handle each error separately.
          */
          throw {
            type: "error",
            function: fnName,
            message:
              "An internal error occured. This is likely a bug in holochain.",
          };
        }
        default:
          throw e;
      }
    }

    throw e;
  }
};
