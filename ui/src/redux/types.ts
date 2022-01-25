import { HolochainClient, HoloClient } from "@holochain-open-dev/cell-client";
import { AgentPubKey, CellId, AdminWebsocket } from "@holochain/conductor-api";
import { Action, AnyAction } from "redux";
import { ThunkAction as Thunk, ThunkDispatch } from "redux-thunk";
import { AgentPubKeyBase64 } from "./p2pmessages/types";

import rootReducer from "./reducers";

export interface CallZomeConfig {
  cap?: null | any;
  cellId?: CellId;
  provenance?: AgentPubKey;
  zomeName: string;
  fnName: string;
  payload?: any;
}

interface HolochainConfig {
  getAgentId: () => Promise<AgentPubKey | null>;
  callZome: (config: CallZomeConfig) => Promise<any>;
  retry: (config: CallZomeConfig) => Promise<any>;
  client: null | HolochainClient | HoloClient;
  adminWs: AdminWebsocket | null;
  createGroupDna: (creator: AgentPubKeyBase64, timestamp: number) => any;
  init: () => any;
}

export type ThunkAction = Thunk<
  any,
  RootState,
  HolochainConfig,
  Action<string>
>;

export type ReduxDispatch = ThunkDispatch<RootState, any, AnyAction>;
export type RootState = ReturnType<typeof rootReducer>;
