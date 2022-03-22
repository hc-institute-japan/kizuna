import { AgentPubKey, CellId } from "@holochain/client";

export const SET_MY_AGENT_ID = "SET_MY_AGENT_ID";
export const SET_CELL_ID = "SET_CELL_ID";

export interface MyAgentID {
  agentPubKey: AgentPubKey;
}

export interface CellID {
  cellId: CellId;
}

interface SetMyAgentID {
  type: typeof SET_MY_AGENT_ID;
  agentPubKey: AgentPubKey;
}

interface SetCellID {
  type: typeof SET_CELL_ID;
  cellId: CellID;
}

export interface ConductorState {
  agentID: AgentPubKey | null;
  cellID: CellID | null;
}

export type ConductorActionType = SetMyAgentID | SetCellID;
