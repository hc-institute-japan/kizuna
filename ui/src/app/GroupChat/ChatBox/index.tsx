import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// Components
import Chat from "../../../components/Chat";
import { ChatListMethods } from "../../../components/Chat/types";
import { FilePayload, Payload } from "../../../redux/commons/types";
import { getNextBatchGroupMessages } from "../../../redux/group/actions";
import { readGroupMessage } from "../../../redux/group/actions";
import { fetchFilesBytes } from "../../../redux/group/actions";
// Redux
import {
  GroupMessage,
  GroupMessageBundle,
  GroupMessageReadData,
  GroupMessagesOutput,
} from "../../../redux/group/types";
import { Profile } from "../../../redux/profile/types";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";

interface Props {
  messageIds: string[];
  members: string[];
  groupId: string;
  // TODO: not really sure what type this is
  onReply(message: { author: string; payload: Payload; id: string }): any;
  chatList: React.RefObject<ChatListMethods>;
}
const MessageList: React.FC<Props> = ({
  messageIds,
  members,
  onReply,
  chatList,
  groupId,
}) => {
  const dispatch = useAppDispatch();

  /* Selecotrs */
  const filesBytes = useSelector((state: RootState) => state.groups.groupFiles);

  /* LOCAL STATE */
  const [messages, setMessages] = useState<GroupMessageBundle[]>([]);
  const [oldestFetched, setOldestFetched] = useState<boolean>(false);

  const groups = useSelector((state: RootState) => state.groups);
  const membersProfile = useSelector(
    (state: RootState) => state.groups.members
  );
  const profile = useSelector((state: RootState) => state.profile);

  /* Handlers */
  const handleOnScrollTop = (complete: any) => {
    if (!oldestFetched) {
      let lastMessage = messages[0];
      dispatch(
        getNextBatchGroupMessages({
          groupId: groupId,
          // the entry hash of the last message in the last batch fetched
          lastFetched: lastMessage.groupMessageId,
          // 0 - seconds since epoch, 1 - nanoseconds. See Timestamp type in hdk doc for more info.
          lastMessageTimestamp: lastMessage.timestamp,
          batchSize: 10,
          payloadType: { type: "ALL", payload: null },
        })
      ).then((res: GroupMessagesOutput) => {
        if (res && Object.keys(res.groupMessagesContents).length <= 0) {
          setOldestFetched(true);
        }
        complete();
      });
    }
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
      dispatch(fetchFilesBytes([file.fileHash])).then(
        (res: { [key: string]: Uint8Array }) => {
          if (res && Object.keys(res).length > 0) {
            const fetchedFileBytes = res[file.fileHash];
            const blob = new Blob([fetchedFileBytes]); // change resultByte to bytes
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = file.fileName;
            link.click();
          }
        }
      );
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
    /* 
      Retrieve the messgaes from redux store and modify
      the author field to Profile type.
    */
    const messages: GroupMessageBundle[] = messageIds.map((messageId) => {
      /* retrieve the message content from redux */
      const message: GroupMessage = groups.messages[messageId];
      const authorProfile: Profile = groups.members[message.author];

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
    setMessages(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIds]);

  return (
    <>
      <Chat.ChatList
        disabled={oldestFetched}
        onScrollTop={(complete) => handleOnScrollTop(complete)}
        ref={chatList}
        type="group"
      >
        {messages!.map((message, i) => {
          if (message.author.id === profile.id)
            return (
              <Chat.Me
                id={message.groupMessageId}
                onDownload={handleOnDownload}
                key={i}
                author={message.author.username}
                timestamp={message.timestamp}
                payload={message.payload}
                readList={message.readList}
                replyTo={
                  message.replyTo
                    ? {
                        payload: message.replyTo!.payload,
                        author: {
                          id: membersProfile[message.replyTo!.author].id,
                          username:
                            membersProfile[message.replyTo!.author].username,
                        },
                        id: `${i}`,
                      }
                    : undefined
                }
                type="group"
                showName={true}
                showProfilePicture={true}
                onReply={(message) => onReply(message)}
              />
            );
          return (
            <Chat.Others
              id={message.groupMessageId}
              onDownload={handleOnDownload}
              key={i}
              author={message.author.username}
              timestamp={message.timestamp}
              payload={message.payload}
              readList={message.readList}
              type="group"
              replyTo={
                message.replyTo
                  ? {
                      payload: message.replyTo!.payload,
                      author: {
                        id: membersProfile[message.replyTo!.author].id,
                        username:
                          membersProfile[message.replyTo!.author].username,
                      },
                      id: `${i}`,
                    }
                  : undefined
              }
              showName={true}
              onSeen={(complete) => handleOnSeen(complete, message)}
              onReply={(message) => onReply(message)}
              showProfilePicture={true}
            />
          );
        })}
      </Chat.ChatList>
    </>
  );
};

export default MessageList;
