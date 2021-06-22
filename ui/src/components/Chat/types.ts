import { ReactElement } from "react";
import { FilePayload, Payload } from "../../redux/commons/types";

export interface ChatListProps {
  type?: "p2p" | "group";
  children: ReactElement<ChatProps> | Array<ReactElement<ChatProps>>;
  disabled?: boolean;
  onScrollTop?: (
    complete: () => Promise<void>,
    event: CustomEvent<void>
  ) => any;
}

export interface ChatProps {
  id: string;
  type?: "group" | "p2p";
  author: string;
  timestamp: Date;
  payload: Payload;
  readList: {
    [key: string]: Date;
  };
  showProfilePicture?: boolean;
  showName?: boolean;
  isSeen?: boolean;
  onSeen?(complete: () => any): any;
  onReply?(message: { payload: Payload; author: string; id: string }): any;
  onDownload?(file: FilePayload): any;
}

export interface ChatListMethods {
  scrollToBottom(): any;
}
