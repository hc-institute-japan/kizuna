import { AgentPubKey, CellId } from "@holochain/conductor-api";
import { Action } from "redux";
import { ThunkAction as Thunk } from "redux-thunk";
import { RootState } from "../redux/reducers";

export interface CallZomeConfig {
  // still undefined
  cap?: null | any;
  cellId?: CellId;
  provenance?: AgentPubKey;
  // still undefined
  zomeName: string;
  fnName: string;
  payload?: any;
}

interface HolochainConfig {
  getAgentId: () => Promise<AgentPubKey | undefined>;
  callZome: (config: CallZomeConfig) => Promise<any>;
}

export type ThunkAction = Thunk<
  any,
  RootState,
  HolochainConfig,
  Action<string>
>;
export type AsyncThunkAction = Promise<
  Thunk<Promise<any>, RootState, unknown, Action<string>>
>;

export interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  name: string;
  src: string;
  sender?: string;
  messages: Message[];
}

export type Conversations = Conversation[];
