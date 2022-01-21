import {
  HolochainClient,
  HoloClient,
  WebSdkClient,
} from "@holochain-open-dev/cell-client";
import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";
import { store } from "../containers/ReduxContainer";
import { handleSignal } from "../redux/signal/actions";
import { CallZomeConfig } from "../redux/types";
import { appId, appUrl, ENV } from "./constants";
// @ts-ignore
global.COMB = undefined;
// @ts-ignore
window.COMB = require("@holo-host/comb").COMB;

export let client: null | HolochainClient | HoloClient = null;

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
      const client = new WebSdkClient(appUrl()!, branding);

      await client.connection.ready();
      await client.connection.signIn();

      const appInfo = await client.connection.appInfo(appId());

      console.log("here is the appInfo, ", appInfo);

      if (!appInfo.cell_data)
        throw new Error(`Holo appInfo() failed: ${JSON.stringify(appInfo)}`);

      const cellData = appInfo.cell_data[0];
      console.log("the cell data is: ", cellData);

      // TODO: remove this when chaperone is fixed
      if (!(cellData.cell_id[0] instanceof Uint8Array)) {
        cellData.cell_id = [
          new Uint8Array((cellData.cell_id[0] as any).data),
          new Uint8Array((cellData.cell_id[1] as any).data),
        ] as any;
      }

      const holoClient = new HoloClient(client, cellData);
      holoClient.addSignalHandler(signalHandler);
      return holoClient;
    }
    case "HCDEV":
    case "HC": {
      const appWs = await AppWebsocket.connect(
        appUrl() as string,
        60000,
        signalHandler
      );

      const appInfo = await appWs.appInfo({
        installed_app_id: appId() as string,
      });
      const cellData = appInfo.cell_data[0];

      return new HolochainClient(appWs, cellData);
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
    Object.values(error as object).forEach((e) => console.error(e));
    console.error(error);
    throw error;
  }
};

let myAgentId: AgentPubKey | null;

/* DO NOT USE THIS AS IT IS BUT INSTEAD USE THE getAgentId() ACTION FROM PROFILE INSTEAD */
export const getAgentId: () => Promise<AgentPubKey | null> = async () => {
  if (myAgentId) return myAgentId;
  await init();
  try {
    const info = await client?.cellId[1];
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

  const { zomeName, fnName, payload = null } = config;

  const max_retries = 5;
  let retryCount = 0;
  let callFailed = true;

  while (callFailed && retryCount < max_retries) {
    try {
      return await client?.callZome(
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
    // cellId = info?.cell_data[0].cell_id,
    zomeName,
    fnName,
    // provenance = info?.cell_data[0].cell_id[1],
    payload = null,
  } = config;
  try {
    return await client?.callZome(
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
