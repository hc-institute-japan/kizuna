import React from "react";
import ChatList from "./ChatList";
import { ChatListProps, ChatProps } from "./types";
import Me from "./Me";
import Others from "./Others";

const Chat: {
  ChatList: React.FC<ChatListProps>;
  Me: React.FC<ChatProps>;
  Others: React.FC<ChatProps>;
} = {
  ChatList,
  Me,
  Others,
};

export { Me, Others, ChatList };

export default Chat;
