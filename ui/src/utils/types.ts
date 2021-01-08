export interface Profile {
    id: string;
    username: string;
}

export interface Message {
    id: string;
    sender: string;
    message: string;
}

export interface Conversation {
    id: string;
    name: string;
    src: string;
    sender?: string;
    messages: Message[]
}

export type Conversations = Conversation[]