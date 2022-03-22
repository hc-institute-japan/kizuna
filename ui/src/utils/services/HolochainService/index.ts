import { HolochainClient, HoloClient } from "@holochain-open-dev/cell-client";
import {
  AdminWebsocket,
  AgentPubKey,
  AppSignalCb,
  CellId,
} from "@holochain/client";
import { store } from "../../../containers/ReduxContainer";
import { handleSignal } from "../../../redux/signal/actions";
import { CallZomeConfig } from "../../../redux/types";

// @ts-ignore
global.COMB = undefined;
// @ts-ignore
window.COMB = require("@holo-host/comb").COMB;

// CONSTANTS
export const ENV: "HCDEV" | "HC" | "HCC" | "HOLO" = process.env
  .REACT_APP_ENV as any;

export const appId = (): string | undefined => {
  if (ENV === "HC" || ENV === "HCDEV") {
    return "kizuna";
  } else if (ENV === "HCC") {
    return "uhCkkHSLbocQFSn5hKAVFc_L34ssLD52E37kq6Gw9O3vklQ3Jv7eL";
  } else if (ENV === "HOLO") {
    return undefined;
  }
};

export const appUrl = () => {
  // for launcher
  if (ENV === "HC") return `ws://localhost:8888`;
  else if (ENV === "HCDEV") return process.env.REACT_APP_DNA_INTERFACE_URL;
  else if (ENV === "HCC")
    return `http://localhost:${process.env.REACT_APP_CHAPERONE_PORT}`;
  else if (ENV === "HOLO") return "https://devnet-chaperone.holo.host";
  else return null;
};

export const isHoloEnv = () => {
  return ENV === "HCC" || ENV === "HOLO";
};

export let client: null | HolochainClient | HoloClient = null;
export let adminWs: AdminWebsocket | null = null;

let signalHandler: AppSignalCb = (signal) =>
  store?.dispatch(
    handleSignal(signal.data.payload.name, signal.data.payload.payload)
  );

const createClient = async (
  env: string
): Promise<HoloClient | HolochainClient | null> => {
  switch (env) {
    case "HOLO":
    case "HCC": {
      const branding = {
        logo_url: "assets/icon/kizuna_logo.png",
        app_name: "Kizuna Messaging App",
        skip_registration: true,
      };

      const client: HoloClient = await HoloClient.connect(
        appUrl()!,
        appId()!,
        branding
      );

      client.addSignalHandler(signalHandler);

      await client.signIn();

      return client;
    }
    case "HCDEV":
    case "HC": {
      const client: HolochainClient = await HolochainClient.connect(
        appUrl() as string,
        appId() as string
      );

      // if (!adminWs) {
      //   adminWs = await AdminWebsocket.connect(adminUrl()!, 60000);
      //   adminWs.client.socket.addEventListener("close", () => {
      //     console.log("admin websocket closed");
      //   });
      // }

      client.addSignalHandler(signalHandler);

      return client;
    }
    default: {
      return null;
    }
  }
};

export const init: () => any = async () => {
  if (client) return client;
  try {
    client = await createClient(ENV);
    return client;
  } catch (error) {
    Object.values(error as any).forEach((e) => console.error(e));
    console.error(error);
    throw error;
  }
};

let myAgentId: AgentPubKey | null;

/* DO NOT USE THIS AS IT IS BUT INSTEAD USE THE getAgentId() ACTION FROM PROFILE INSTEAD */
export const getAgentId: () => Promise<AgentPubKey | null> = async () => {
  console.log(myAgentId);
  if (myAgentId) return myAgentId;
  await init();
  try {
    const info = await client?.appInfo.cell_data[0].cell_id[1];
    console.log("this is the agent id, ", info);

    if (info) return info;
    return null;
  } catch (e) {
    console.warn(e);
  }
  return null;
};

const backOff = (count: number) => {
  let waitTime = (2 ** count + Math.random()) * 1000;
  console.log("Retrying after ", waitTime);
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

export const retry: (config: CallZomeConfig) => Promise<any> = async (
  config
) => {
  console.log("entering backoff");
  await init();

  const {
    cellId = await getLobbyCellId(),
    zomeName,
    fnName,
    payload = null,
  } = config;

  const max_retries = 5;
  let retryCount = 0;
  let callFailed = true;

  while (callFailed && retryCount < max_retries) {
    try {
      return await client?.callZome(
        cellId!,
        zomeName,
        fnName,
        payload,
        process.env.REACT_APP_ENV === "HC" ||
          process.env.REACT_APP_ENV === "HCDEV"
          ? 30000
          : undefined
      );
    } catch (e) {
      console.warn(e);
      const { type = null, data = null } = { ...(e as any) };
      if (type === "error") {
        switch (data?.type) {
          case "ribosome_error":
            console.log("ribsosome error", e);

            const networkRegex = /Network error/;
            const networkMatch = networkRegex.exec(data.data);

            if (networkMatch !== null) {
              await backOff(retryCount);
              retryCount += 1;
            } else {
              callFailed = false;
              const regex = /Guest\("([\s\S]*?)"\)/;
              const result = regex.exec(data.data);
              throw {
                type: "error",
                function: fnName,
                message: result ? result[1] : "Something went wrong",
              };
            }
            break;
          case "internal_error":
            console.log("internal error", e);
            if (retryCount > max_retries) {
              throw {
                type: "error",
                function: fnName,
                message:
                  "An internal error occured. This is likely a bug in holochain.",
              };
            } else {
              await backOff(retryCount);
              retryCount += 1;
            }
            break;
          default:
            console.log("default error", e);
            if (retryCount > max_retries) {
              throw e;
            } else {
              await backOff(retryCount);
              retryCount += 1;
            }
        }
      }
    }
  }
};

export const callZome: (config: CallZomeConfig) => Promise<any> = async (
  config
) => {
  await init();
  const {
    cellId = await getLobbyCellId(), // by default get the lobby cell Id.
    zomeName,
    fnName,
    // provenance = info?.cell_data[0].cell_id[1],
    payload = null,
  } = config;
  try {
    console.log("callZome calling ", fnName);
    return await client?.callZome(
      cellId!, // expecting cell id to be non-nullable.
      zomeName,
      fnName,
      payload,
      process.env.REACT_APP_ENV === "HC" ||
        process.env.REACT_APP_ENV === "HCDEV"
        ? 60000
        : undefined
    );
  } catch (e) {
    console.log(
      "zome call has failed in zome: ",
      zomeName,
      " with call ",
      fnName,
      ". Error: ",
      e
    );
    const { type = null, data = null } = { ...(e as any) };
    if (type === "error") {
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
            message: data.data,
          };
        }
        default:
          throw e;
      }
    }

    throw e;
  }
};

// only for lobby
export const getLobbyCellId = async (): Promise<CellId | undefined> => {
  await init();
  return client?.cellDataByRoleId("kizuna-lobby")?.cell_id;
};
