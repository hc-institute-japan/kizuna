import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Me from "../../components/Me";
import Others from "../../components/Others";
import { fetchId } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import { Uint8ArrayToBase64, useAppDispatch } from "../../utils/helpers";
import styles from "./style.module.css";
import { GroupMessage } from "../../redux/group/types";
import { getMessagesByGroupByTimestamp } from "../../redux/group/actions";
import { IonLoading } from "@ionic/react";
import Chat from "../../components/Chat";
interface Props {
  messageIds: string[];
  members: string[];
  myAgentId: string;
}
const MessageList: React.FC<Props> = ({ messageIds, members, myAgentId }) => {
  let { username } = useSelector((state: RootState) => state.profile)
  const messagesData = useSelector((state: RootState) => {
    let uniqueArray = messageIds.filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });
    const messages: (any | undefined)[] = uniqueArray ? uniqueArray.map((messageId) => {
      let message: GroupMessage = state.groups.messages[messageId];
      let allMembers  = state.groups.members;

      if (message) {
        const authorProfile = allMembers[message.author];
        return {
          ...message,
          author: authorProfile
            ? authorProfile
            // if profile was not found from allMembers, then the author is self
            // assuming that allMembers have all the members of group at all times
            : {
                username: state.profile.username!,
                id: message.author,
              },
        };
      }
      return null;
    }) : [];

    // TODO: handle fetching of missing messages (most likely won't occur)
    if (messages.find((message) => message === null)) return null;
    messages.sort((x, y) => {
      return x.timestamp.valueOf()[0] - y.timestamp.valueOf()[0]
    })
    return messages;
  });

  // BUG: The screen does not scroll to the latest message sent or received
  return (
    <Chat.ChatList author={username!} type="group">
      {messagesData!.map((message) => {
        if (message.author.id === myAgentId) return <Chat.Me key={message.groupMessageEntryHash} author={message.author.username} timestamp={message.timestamp} payload={message.payload} readList={message.readList} />;
        return <Chat.Others key={message.groupMessageEntryHash} author={message.author.username} timestamp={message.timestamp} payload={message.payload} readList={message.readList} />;
      })}
    </Chat.ChatList>
  );
};

export default MessageList;
