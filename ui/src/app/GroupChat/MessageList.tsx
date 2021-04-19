import React from "react";
import { useSelector } from "react-redux";

import { RootState } from "../../redux/types";
import { GroupMessage } from "../../redux/group/types";
import Chat from "../../components/Chat";
import { ChatListMethods } from "../../components/Chat/types";
interface Props {
  messageIds: string[];
  members: string[];
  myAgentId: string;
  // TODO: not really sure what type this is
  chatList: React.RefObject<ChatListMethods>
}
const MessageList: React.FC<Props> = ({ messageIds, members, myAgentId, chatList }) => {
  const messagesData = useSelector((state: RootState) => {
    let uniqueArray = messageIds.filter(function (item, pos, self) {
      return self.indexOf(item) === pos;
    });
    const messages: (any | undefined)[] = uniqueArray
      ? uniqueArray.map((messageId) => {
          let message: GroupMessage = state.groups.messages[messageId];
          let allMembers = state.groups.members;

          if (message) {
            const authorProfile = allMembers[message.author];
            return {
              ...message,
              author: authorProfile
                ? authorProfile
                : // if profile was not found from allMembers, then the author is self
                  // assuming that allMembers have all the members of group at all times
                  {
                    username: state.profile.username!,
                    id: message.author,
                  },
            };
          }
          return null;
        })
      : [];

    // TODO: handle fetching of missing messages (most likely won't occur)
    if (messages.find((message) => message === null)) return null;
    messages.sort((x, y) => {
      return x.timestamp.valueOf()[0] - y.timestamp.valueOf()[0];
    });
    return messages;
  });

  return (
    <Chat.ChatList ref={chatList} type="group" >
      {messagesData!.map((message) => {
        if (message.author.id === myAgentId) return <Chat.Me key={message.groupMessageEntryHash} author={message.author.username} timestamp={new Date(message.timestamp[0] * 1000)} payload={message.payload} readList={message.readList} type={"group"} showName={true} showProfilePicture={true} />;
        return <Chat.Others key={message.groupMessageEntryHash} author={message.author.username} timestamp={new Date(message.timestamp[0] * 1000)} payload={message.payload} readList={message.readList} type={"group"} showName={true} showProfilePicture={true} />;
      })}
    </Chat.ChatList>
  );
};

export default MessageList;
