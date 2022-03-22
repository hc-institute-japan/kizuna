import { ThunkAction } from "../../types";

const getAgentId =
  (): ThunkAction =>
  async (_dispatch, getState, { getAgentId }) => {
    // await getAgentId();
    let myAgentId = getState().conductor.agentID;
    myAgentId = myAgentId !== null ? myAgentId : await getAgentId();
    return myAgentId;
  };
export default getAgentId;
