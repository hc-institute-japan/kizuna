import React from "react";
import ChatList from "./ChatList";
import { ChatListProps } from "./types";
import Me, { MeProps } from "./components/Me";
import Others, { OthersProps } from "./components/Others";

const Chat: {
  ChatList: React.FC<ChatListProps>;
  Me: React.FC<MeProps>;
  Others: React.FC<OthersProps>;
} = {
  ChatList,
  Me,
  Others,
};

export default Chat;
