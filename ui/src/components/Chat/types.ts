import { ReactElement } from "react";
import { Payload } from "../../redux/commons/types";

export interface ChatListProps {
  type?: "p2p" | "group";
  children: ReactElement<ChatProps> | Array<ReactElement<ChatProps>>;
}

export interface ChatProps {
  type?: "group" | "p2p";
  author: string;
  timestamp: Date;
  payload: Payload;
  readList: {
    [key: string]: Date;
  };
  showProfilePicture?: boolean;
  showName?: boolean;
}
