import React from "react";
import ChatList from "./ChatList";
import { ChatListProps, ChatProps } from "./types";
import Me from "./components/Me";
import Others from "./components/Others";

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
