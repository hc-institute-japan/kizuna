import {
  // AdminWebsocket,
  AgentPubKey,
  AppSignalCb,
  // CellId,
  // RoleId,
  AppWebsocket,
} from "@holochain/client";
import { store } from "../../../containers/ReduxContainer";
import { handleSignal } from "../../../redux/signal/actions";
import { CallZomeConfig } from "../../../redux/types";
import WebSdk from "@holo-host/web-sdk";

// @ts-ignore
// global.COMB = undefined;
// @ts-ignore
// window.COMB = require("@holo-host/comb").COMB;
window.WebSdk = WebSdk;

// CONSTANTS
export const ENV: "HCDEV" | "HC" | "HOLODEV" | "HOLO" = process.env
  .REACT_APP_ENV as any;

export const HOLO_DEV_SERVER_PORT = process.env.HOLO_DEV_SERVER_PORT;

export const appId = (): string | undefined => {
  switch (ENV) {
    case "HC":
    case "HCDEV":
      return "kizuna";
    case "HOLODEV":
      return "uhCkkHSLbocQFSn5hKAVFc_L34ssLD52E37kq6Gw9O3vklQ3Jv7eL";
    case "HOLO":
    default:
      return undefined;
  }
  // if (ENV === "HC" || ENV === "HCDEV") {
  //   return "kizuna";
  // } else if (ENV === "HOLODEV") {
  //   return "uhCkkHSLbocQFSn5hKAVFc_L34ssLD52E37kq6Gw9O3vklQ3Jv7eL";
  // } else if (ENV === "HOLO") {
  //   return undefined;
  // }
};

export const appUrl = () => {
  switch (ENV) {
    case "HC":
      return `ws://localhost:8888`;
    case "HCDEV":
      return process.env.REACT_APP_DNA_INTERFACE_URL;
    case "HOLO":
      return "https://chaperone.holo.hosting";
    case "HOLODEV":
      return `http://localhost:${process.env.REACT_APP_CHAPERONE_PORT}`;
    default:
      return null;
  }
  // for launcher
  // if (ENV === "HC") return `ws://localhost:8888`;
  // else if (ENV === "HCDEV") return process.env.REACT_APP_DNA_INTERFACE_URL;
  // else if (ENV === "HOLODEV")
  //   return `http://localhost:${process.env.REACT_APP_CHAPERONE_PORT}`;
  // else if (ENV === "HOLO") return "https://devnet-chaperone.holo.host";
  // else return null;
};

export let client: any;
// export let client: null | HolochainClient | HoloClient = null;
// export let adminWs: AdminWebsocket | null = null;

let myAgentId: AgentPubKey | null;

let signalHandler: AppSignalCb = (signal: any) => {
  console.log("signal payload", signal);
  return store?.dispatch(handleSignal(signal.data.name, signal.data.payload));
};

const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

// REDUX

const createClient = async (
  env: string
  // ): Promise<HoloClient | HolochainClient | AppWebsocket | null> => {
): Promise<any> => {
  switch (env) {
    case "HOLO":
    case "HOLODEV":
      const branding = {
        logoUrl: "assets/icon/kizuna_logo.png",
        appName: "Kizuna Messaging App",
        requireRegistrationCode: false,
      };

      /* CELL-CLIENT 0.5.3
      client = await HoloClient.connect(
        "http://127.0.0.1:" + HOLO_DEV_SERVER_PORT,
        "kizuna-messaging-app",
        branding
      );
      */

      const holoclient = await WebSdk.connect({
        chaperoneUrl: appUrl(),
        authFormCustomization: branding,
      });

      holoclient.on("agent-state", (agent_state: any) => {
        myAgentId = agent_state.id;
      });

      holoclient.on("signal", (payload: any) => signalHandler(payload));

      while (!holoclient.agent.isAvailable) {
        await sleep(50);
      }

      if (holoclient.agent.isAnonymous) await holoclient.signIn();

      // while (holoclient.agent.isAnonymous || !holoclient.agent.isAvailable) {
      //   await sleep(50);
      // }

      return holoclient;
    case "HCDEV":
    case "HC":
      console.log("creating client for holochain");

      // TODO: WHEN THIS CODE BLOCK GETS COMMENTED IN WE GET THE IFRAME IS UNDEFINED ERROR

      // CELL-CLIENT 0.5.3
      // const hcclient: HolochainClient = await HolochainClient.connect(
      //   appUrl() as string,
      //   appId() as string
      // );
      // const hcclient = new HolochainClient(appWebSocket);

      // HOLOCHAIN/CLIENT
      // const hcclient: any = await AppWebsocket.connect(
      //   appUrl() as string,
      //   30000,
      //   signalHandler
      // );

      // if (!adminWs) {
      //   adminWs = await AdminWebsocket.connect(adminUrl()!, 60000);
      //   adminWs.client.socket.addEventListener("close", () => {
      //     console.log("admin websocket closed");
      //   });
      // }
      // hcclient.addSignalHandler(signalHandler);

      // return hcclient;
      return null;
    default:
      return null;
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

/* DO NOT USE THIS AS IT IS BUT INSTEAD USE THE getAgentId() ACTION FROM PROFILE INSTEAD */
export const getAgentId: () => Promise<AgentPubKey | null> = async () => {
  if (myAgentId) return myAgentId;
  await init();
  try {
    const info = await client?.appInfo.cell_data[0].cell_id[1];
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
    // cellId = await getLobbyCellId(),
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
        // cellId!,
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
    // calling getLobbyCellId() results in getMyProfile error (unclear error yet)
    // cellId = await getLobbyCellId(), // by default get the lobby cell Id.
    zomeName,
    fnName,
    // provenance = info?.cell_data[0].cell_id[1],
    payload = null,
  } = config;
  try {
    switch (ENV) {
      case "HOLO":
      case "HOLODEV":
        const holores = await client?.zomeCall({
          roleId: "kizuna-lobby",
          zomeName: zomeName,
          fnName: fnName,
          payload: payload,
        });
        console.log("res", holores);
        return holores.data;
      case "HC":
      case "HCDEV":
        const hcres = await client?.callZome(
          // cellId!, // expecting cell id to be non-nullable.
          null,
          undefined,
          zomeName,
          fnName,
          payload,
          process.env.REACT_APP_ENV === "HC" ||
            process.env.REACT_APP_ENV === "HCDEV"
            ? 60000
            : undefined
        );
        return hcres;
    }
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
// export const getLobbyCellId = async (): Promise<CellId | undefined> => {
//   await init();
//   return client?.cellDataByRoleId("kizuna-lobby")?.cell_id;
// };
