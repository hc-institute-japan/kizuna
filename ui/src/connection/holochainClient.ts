import {
  AgentPubKey,
  AppSignalCb,
  AppWebsocket,
} from "@holochain/conductor-api";
import { store } from "../containers/ReduxContainer";
import { handleSignal } from "../redux/signal/actions";

import { CallZomeConfig } from "../redux/types";
import { HolochainClient, HoloClient } from "@holochain-open-dev/cell-client";
const { Connection } = require("@holo-host/web-sdk");

let client: null | HolochainClient | HoloClient = null;

let signalHandler: AppSignalCb = (signal) =>
  store?.dispatch(
    handleSignal(signal.data.payload.name, signal.data.payload.payload)
  );

const init: () => any = async () => {
  if (client) {
    return client;
  }
  try {
    const appWs = await AppWebsocket.connect(
      process.env.REACT_APP_DNA_INTERFACE_URL as string,
      15000, // holochain's default timeout
      signalHandler
    );
    // const appInfo = await appWs.appInfo({
    //   installed_app_id: "test-app",
    // });
    // const cellData = appInfo.cell_data[0];

    // client = new HolochainClient(appWs, cellData);

    const branding = { app_name: "kizuna" };
    const connection = new Connection(null, signalHandler, branding); // URL for chaperone

    await connection.ready();
    await connection.signIn();

    const appInfo = await connection.appInfo();

    const cellData = appInfo.cell_data[0];

    client = new HoloClient(appWs, cellData, branding);
    return client;
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
    const id = client?.cellId[1] || null;
    myAgentId = id;
    return myAgentId;
  } catch (e) {
    console.warn(e);
  }
  return null;
};

export const callZome: (config: CallZomeConfig) => Promise<any> = async (
  config
) => {
  await init();

  const id = client?.cellId[1];

  const { cellId = id, zomeName, fnName, payload = null } = config;
  try {
    if (cellId) {
      return await client?.callZome(zomeName, fnName, payload);
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

// import {
//   AgentPubKey,
//   AppSignalCb,
//   AppWebsocket,
// } from "@holochain/conductor-api";
// import { store } from "../containers/ReduxContainer";
// import { handleSignal } from "../redux/signal/actions";

// import { CallZomeConfig } from "../redux/types";

// let client: null | AppWebsocket = null;

// let signalHandler: AppSignalCb = (signal) =>
//   store?.dispatch(
//     handleSignal(signal.data.payload.name, signal.data.payload.payload)
//   );

// const init: () => any = async () => {
//   if (client) {
//     return client;
//   }
//   try {
//     client = await AppWebsocket.connect(
//       process.env.REACT_APP_DNA_INTERFACE_URL as string,
//       15000, // holochain's default timeout
//       signalHandler
//     );
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// let myAgentId: AgentPubKey | null;

// /* DO NOT USE THIS AS IT IS BUT INSTEAD USE THE getAgentId() ACTION FROM PROFILE INSTEAD */
// export const getAgentId: () => Promise<AgentPubKey | null> = async () => {
//   if (myAgentId) {
//     return myAgentId;
//   }
//   await init();
//   try {
//     const info = await client?.appInfo({ installed_app_id: "test-app" });

//     if (info?.cell_data[0].cell_id[1]) {
//       myAgentId = info?.cell_data[0].cell_id[1];
//       return myAgentId;
//     }
//     return null;
//   } catch (e) {
//     console.warn(e);
//   }
//   return null;
// };

// export const callZome: (config: CallZomeConfig) => Promise<any> = async (
//   config
// ) => {
//   await init();

//   const info = await client?.appInfo({ installed_app_id: "test-app" });
//   const {
//     cap = null,
//     cellId = info?.cell_data[0].cell_id,
//     zomeName,
//     fnName,
//     provenance = info?.cell_data[0].cell_id[1],
//     payload = null,
//   } = config;
//   try {
//     if (cellId && provenance) {
//       return await client?.callZome({
//         cap: cap,
//         cell_id: cellId,
//         zome_name: zomeName,
//         fn_name: fnName,
//         payload,
//         provenance,
//       });
//     }
//   } catch (e) {
//     console.warn(e);
//     const { type = null, data = null } = { ...e };
//     if (type === "error") {
//       console.warn(fnName);
//       switch (data?.type) {
//         case "ribosome_error": {
//           const regex = /Guest\("([\s\S]*?)"\)/;
//           const result = regex.exec(data.data);
//           throw {
//             type: "error",
//             function: fnName,
//             message: result ? result[1] : "Something went wrong",
//           };
//         }
//         case "internal_error": {
//           /*
//               temporarily throwing a custom error for any internal_error
//               until we have a better grasp of how to handle each error separately.
//             */
//           throw {
//             type: "error",
//             function: fnName,
//             message:
//               "An internal error occured. This is likely a bug in holochain.",
//           };
//         }
//         default:
//           throw e;
//       }
//     }

//     throw e;
//   }
// };
