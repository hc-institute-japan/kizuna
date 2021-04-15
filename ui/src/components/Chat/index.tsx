import React, { ForwardRefExoticComponent, RefAttributes } from "react";
import ChatList from "./ChatList";
import { ChatListMethods, ChatListProps, ChatProps } from "./types";
import Me from "./Me";
import Others from "./Others";

const Chat: {
  ChatList: ForwardRefExoticComponent<ChatListProps & RefAttributes<ChatListMethods>>;
  Me: React.FC<ChatProps>;
  Others: React.FC<ChatProps>;
} = {
  ChatList,
  Me,
  Others,
};

export { Me, Others, ChatList };

export default Chat;
