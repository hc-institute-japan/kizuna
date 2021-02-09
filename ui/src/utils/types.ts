/**
 * Temporary place of types
 */

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
