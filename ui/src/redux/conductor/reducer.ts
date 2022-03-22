import {
  ConductorActionType,
  ConductorState,
  SET_MY_AGENT_ID,
  SET_CELL_ID,
} from "./types";

const initialState: ConductorState = {
  agentID: null,
  cellID: null,
};

const reducer = (state = initialState, action: ConductorActionType) => {
  switch (action.type) {
    case SET_MY_AGENT_ID:
      return { ...state, agentID: action.agentPubKey };
    case SET_CELL_ID:
      return { ...state, blocked: action.cellId };
    default:
      return state;
  }
};

export default reducer;
