import { deserializeHash } from "@holochain-open-dev/core-types";
import { AppWebsocket } from "@holochain/conductor-api";
import { generatePassphrase } from "../../../utils/helpers";
import { ThunkAction } from "../../types";

export const createGroupDna =
  (creator: string, timestamp: number): ThunkAction =>
  async (_dispatch, _getState, { callZome, createGroupDna }) => {
    const groupDnaCellId = await createGroupDna(creator, timestamp);
    const creatorKey = deserializeHash(creator);
    const passphrase = await generatePassphrase();
    const res = await callZome({
      zomeName: "meta",
      fnName: "create_group_meta",
      cellId: groupDnaCellId,
      payload: {
        creator: creatorKey,
        created: timestamp,
        passphrase,
        image: null, // TODO: set the image
        members: [], // TODO: set the initial members selected by the creator
      },
    });
    console.log(res);

    return groupDnaCellId;
  };

export const test =
  (): ThunkAction =>
  async (_dispatch, _getState, { callZome, init, adminWs, client }) => {
    await init();
    // this assumes the current pattern of "cloning" DNA where an app with the cell of template DNA
    // is instantiated
    console.log(adminWs);
    console.log(client);
    const activeGroupApps = await (
      await adminWs!.listActiveApps()
    ).filter((id) => id.includes("kizuna-group"));
    const groupCellIds = await Promise.all(
      activeGroupApps.map(async (installed_app_id) => {
        const groupAppsInfo = await (
          (client as any).appWebsocket as AppWebsocket
        ).appInfo({
          installed_app_id,
        });
        return groupAppsInfo.cell_data[0].cell_id;
      })
    );

    const res: string = await callZome({
      zomeName: "meta",
      fnName: "test_function",
      cellId: groupCellIds[0],
    });
    return res;
  };
