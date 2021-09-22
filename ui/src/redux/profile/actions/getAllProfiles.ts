import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";

const getAllProfiles =
  (): ThunkAction =>
  async (_dispatch, _getState, { callZome, getAgentId }) => {
    const myId = await getAgentId();
    const res = await callZome({
      zomeName: ZOMES.PROFILES,
      fnName: FUNCTIONS[ZOMES.PROFILES].GET_ALL_PROFILES,
    });
    // console.log(
    //   res.filter(
    //     (agents: any) => agents.agent_pub_key !== serializeHash(myId as Buffer)
    //   )
    // );

    return res.filter(
      (agents: any) => agents.agent_pub_key !== serializeHash(myId as Buffer)
    );
  };

export default getAllProfiles;
