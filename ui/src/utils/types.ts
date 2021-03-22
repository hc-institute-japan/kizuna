/**
 * Temporary place of types
 */

import { Profile } from "../redux/profile/types";

export interface Message {
  id: string;
  sender: Profile;
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
