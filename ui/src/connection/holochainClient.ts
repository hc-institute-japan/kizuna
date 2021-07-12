import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";
import { store } from "../containers/ReduxContainer";
import { handleSignal } from "../redux/signal/actions";

import { CallZomeConfig } from "../redux/types";

let client: null | AppWebsocket = null;

let signalHandler: AppSignalCb = (signal) =>
  store?.dispatch(
    handleSignal(signal.data.payload.name, signal.data.payload.payload)
  );

const init: () => any = async () => {
  if (client) {
    return client;
  }
  try {
    client = await AppWebsocket.connect(
      process.env.REACT_APP_DNA_INTERFACE_URL as string,
      25000, // holochain's default timeout
      signalHandler
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

let myAgentId: AgentPubKey | null;

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

  const info = await client?.appInfo({ installed_app_id: "test-app" });
  const {
    cap = null,
    cellId = info?.cell_data[0].cell_id,
    zomeName,
    fnName,
    provenance = info?.cell_data[0].cell_id[1],
    payload = null,
  } = config;

  const max_retries = 5;
  let retryCount = 0;
  let callFailed = true;

  while (callFailed && retryCount < max_retries) {
    try {
      console.log("callZome for", fnName, " attempt #", retryCount);
      if (cellId && provenance) {
        console.log("calling zome");
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
      const { type = null, data = null } = { ...e };
      if (type === "error") {
        console.warn(fnName);
        switch (data?.type) {
          case "ribosome_error":
            // eslint-disable-next-line no-lone-blocks
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
            // eslint-disable-next-line no-lone-blocks
            {
              console.log("internal error", e);
              /*
            temporarily throwing a custom error for any internal_error
            until we have a better grasp of how to handle each error separately.
          */
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

      // throw e;
    }
  }
};

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
          console.log("holochainclient error", e);
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
