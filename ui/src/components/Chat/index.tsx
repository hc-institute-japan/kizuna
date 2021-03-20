import React from "react";
import ChatList from "./ChatList";
import { ChatListProps } from "./types";

const Chat: { ChatList: React.FC<ChatListProps> } = {
  ChatList,
};

export default Chat;
