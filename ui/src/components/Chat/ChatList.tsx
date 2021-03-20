import React from "react";
import styles from "./style.module.css";
import { ChatListProps } from "./types";

const ChatList: React.FC<ChatListProps> = ({ children, type = "p2p" }) => {
  return <div className={styles.chat}></div>;
};

export default ChatList;
