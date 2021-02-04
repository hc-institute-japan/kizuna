import { Action } from "redux";
import { ThunkAction as Thunk } from "redux-thunk";
import { RootState } from "../redux/reducers";

export type ThunkAction = Thunk<void, RootState, unknown, Action<string>>;

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
