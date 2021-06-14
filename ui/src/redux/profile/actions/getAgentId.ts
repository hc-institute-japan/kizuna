import { ThunkAction } from "../../types";

const getAgentId =
  (): ThunkAction =>
  async (_dispatch, _getState, { getAgentId }) =>
    await getAgentId();

export default getAgentId;
