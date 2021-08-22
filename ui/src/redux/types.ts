import { AgentPubKey, CellId } from "@holochain/conductor-api";
import { Action, AnyAction } from "redux";
import { ThunkAction as Thunk, ThunkDispatch } from "redux-thunk";

import rootReducer from "./reducers";

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
  getAgentId: () => Promise<AgentPubKey | null>;
  callZome: (config: CallZomeConfig) => Promise<any>;
  retry: (config: CallZomeConfig) => Promise<any>;
}

export type ThunkAction = Thunk<
  any,
  RootState,
  HolochainConfig,
  Action<string>
>;

export type ReduxDispatch = ThunkDispatch<RootState, any, AnyAction>;
export type RootState = ReturnType<typeof rootReducer>;
