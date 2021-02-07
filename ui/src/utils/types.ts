import { AgentPubKey, CellId } from "@holochain/conductor-api";
import { Dispatch } from "react";
import { Action, AnyAction } from "redux";
import { ThunkAction as Thunk, ThunkDispatch } from "redux-thunk";
import { RootState } from "../redux/reducers";
import store from "../redux/store";

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

export type ReduxDispatch = ThunkDispatch<RootState, any, AnyAction>;

export type Conversations = Conversation[];
