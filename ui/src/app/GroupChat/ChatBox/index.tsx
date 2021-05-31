import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// Components
import Chat from "../../../components/Chat";
import { ChatListMethods } from "../../../components/Chat/types";
import { FilePayload, Payload } from "../../../redux/commons/types";
import { getNextBatchGroupMessages } from "../../../redux/group/actions/getNextBatchGroupMessages";
import { readGroupMessage } from "../../../redux/group/actions/readGroupMessage";
import { fetchFilesBytes } from "../../../redux/group/actions/setFilesBytes";
// Redux
import {
  GroupMessage,
  GroupMessageReadData,
  GroupMessagesContents,
  GroupMessagesOutput,
} from "../../../redux/group/types";
import { Profile } from "../../../redux/profile/types";
import { RootState } from "../../../redux/types";
import { isTextPayload, useAppDispatch } from "../../../utils/helpers";

interface messageBundle {
  groupMessageId: string;
  groupId: string;
  author: Profile;
  payload: Payload; // subject to change
  timestamp: Date;
  replyTo?: string;
  readList: {
    // key is AgentPubKey
    [key: string]: Date;
  };
}

interface Props {
  messageIds: string[];
  members: string[];
  groupId: string;
  // TODO: not really sure what type this is
  chatList: React.RefObject<ChatListMethods>;
}
const MessageList: React.FC<Props> = ({
  messageIds,
  members,
  chatList,
  groupId,
}) => {
  const dispatch = useAppDispatch();

  /* Selecotrs */
  const filesBytes = useSelector((state: RootState) => state.groups.groupFiles);

  /* LOCAL STATE */
  const [messages, setMessages] = useState<messageBundle[]>([]);
  const [oldestFetched, setOldestFetched] = useState<boolean>(false);
  const [oldestMessage, setOldestMessage] = useState<any>();
  const [newestMessage, setNewestMessage] = useState<GroupMessage>();

  const groups = useSelector((state: RootState) => state.groups);
  const profile = useSelector((state: RootState) => state.profile);

  const messagesData = useSelector((state: RootState) => {
    const messages: messageBundle[] = messageIds.map((messageId) => {
      /* retrieve the message content from redux */
      let message: GroupMessage = state.groups.messages[messageId];
      const authorProfile = groups.members[message.author];

      return {
        ...message,
        author: authorProfile
          ? authorProfile
          : // if profile was not found from allMembers, then the author is self
            // assuming that allMembers have all the members of group at all times
            {
              username: profile.username!,
              id: message.author,
            },
      };
    });

    messages.sort((x, y) => {
      return x.timestamp.getTime() - y.timestamp.getTime();
    });
    return messages;
  });

  /* Handlers */
  const handleOnScrollTop = (complete: any) => {
    if (messagesData?.length) {
      let lastMessage = messagesData![0];
      dispatch(
        getNextBatchGroupMessages({
          groupId: groupId,
          // the entry hash of the last message in the last batch fetched
          lastFetched: oldestMessage
            ? oldestMessage.groupMessageId
            : lastMessage.groupMessageId,
          // 0 - seconds since epoch, 1 - nanoseconds. See Timestamp type in hdk doc for more info.
          lastMessageTimestamp: lastMessage.timestamp,
          batchSize: 10,
          payloadType: { type: "ALL", payload: null },
        })
      ).then((res: GroupMessagesOutput) => {
        if (Object.keys(res.groupMessagesContents).length !== 0) {
          let groupMesssageContents: GroupMessagesContents =
            res.groupMessagesContents;
          const fetchedMessages: (any | undefined)[] = [];
          Object.keys(groupMesssageContents).forEach((key: any) => {
            const authorProfile =
              groups.members[groupMesssageContents[key].author];
            fetchedMessages.push({
              ...groupMesssageContents[key],
              author: authorProfile
                ? authorProfile
                : // if profile was not found from allMembers, then the author is self
                  // assuming that allMembers have all the members of group at all times
                  {
                    username: profile.username!,
                    id: groupMesssageContents[key].author,
                  },
            });
          });
          let newMessages = [...messages, ...fetchedMessages];
          newMessages.sort((x, y) => {
            return x.timestamp.valueOf()[0] - y.timestamp.valueOf()[0];
          });
          let newOldestMessage =
            res.groupMessagesContents[
              res.messagesByGroup[groupId][
                res.messagesByGroup[groupId].length - 1
              ]
            ];
          setOldestMessage(newOldestMessage);
          setMessages(newMessages);
        } else {
          setOldestFetched(true);
        }
      });
    }

    complete();
    return null;
  };

  const handleOnDownload = (file: FilePayload) => {
    const fileBytes = filesBytes[file.fileHash];
    if (fileBytes) {
      const blob = new Blob([fileBytes]); // change resultByte to bytes
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.fileName;
      link.click();
    } else {
      dispatch(fetchFilesBytes([file.fileHash])).then((res: any) => {
        if (res) {
          const fetchedFileBytes = res[`u${file.fileHash}`];
          const blob = new Blob([fetchedFileBytes]); // change resultByte to bytes
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = file.fileName;
          link.click();
        }
      });
    }
  };

  const handleOnSeen = (complete: () => any, message: any) => {
    let read: boolean = Object.keys(message.readList).includes(profile.id!);

    if (!read) {
      let groupMessageReadData: GroupMessageReadData = {
        groupId: groupId,
        messageIds: [message.groupMessageId],
        reader: profile.id!,
        timestamp: message.timestamp,
        members,
      };
      dispatch(readGroupMessage(groupMessageReadData)).then((res: any) => {
        complete();
      });
    }
  };

  /* Effects */

  useEffect(() => {
    setMessages(messagesData!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIds]);

  useEffect(() => {
    let maybeThisGroupNewestMessageKey = Object.keys(groups.messages)[
      Object.keys(groups.messages).length - 1
    ];
    let maybeThisGroupNewestMessage =
      groups.messages[maybeThisGroupNewestMessageKey];
    if (maybeThisGroupNewestMessageKey) {
      if (
        maybeThisGroupNewestMessage.groupId === groupId &&
        maybeThisGroupNewestMessage.groupMessageId !==
          newestMessage?.groupMessageId
      ) {
        setNewestMessage(maybeThisGroupNewestMessage);
      }
    }
  }, [groupId, newestMessage?.groupMessageId]);

  return (
    <>
      <Chat.ChatList
        disabled={oldestFetched}
        onScrollTop={(complete) => handleOnScrollTop(complete)}
        ref={chatList}
        type="group"
      >
        {messages!.map((message, i) => {
          console.log(message);
          if (message.author.id === profile.id)
            return (
              <Chat.Me
                onDownload={handleOnDownload}
                key={i}
                author={message.author.username}
                timestamp={message.timestamp}
                payload={message.payload}
                readList={message.readList}
                type="group"
                showName={true}
                showProfilePicture={true}
              />
            );
          return (
            <Chat.Others
              onDownload={handleOnDownload}
              key={i}
              author={message.author.username}
              timestamp={message.timestamp}
              payload={message.payload}
              readList={message.readList}
              type="group"
              showName={true}
              onSeen={(complete) => handleOnSeen(complete, message)}
              showProfilePicture={true}
            />
          );
        })}
      </Chat.ChatList>
    </>
  );
};

export default MessageList;
