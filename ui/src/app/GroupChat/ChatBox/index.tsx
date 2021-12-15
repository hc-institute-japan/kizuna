import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
// Components
import Chat from "../../../components/Chat";
import { ChatListMethods } from "../../../components/Chat/types";
import {
  FilePayload,
  isTextPayload,
  Payload,
} from "../../../redux/commons/types";
import {
  fetchFilesBytes,
  getMessagesWithProfile,
  getPreviousGroupMessages,
  readGroupMessage,
  sendGroupMessage,
} from "../../../redux/group/actions";
import { pinMessage } from "../../../redux/group/actions/pinMessage";
import { unpinMessage } from "../../../redux/group/actions/unpinMessage";
import { removeErrGroupMessage } from "../../../redux/group/actions";
// Redux
import {
  GroupMessage,
  GroupMessageBundle,
  GroupMessageInput,
  GroupMessageReadData,
  GroupMessagesOutput,
} from "../../../redux/group/types";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";

interface Props {
  messageIds: string[];
  members: string[];
  groupId: string;
  readReceipt: boolean;
  // TODO: not really sure what type this is
  onReply(message: { author: string; payload: Payload; id: string }): any;
  chatList: React.RefObject<ChatListMethods>;
}
const ChatBox: React.FC<Props> = ({
  messageIds,
  members,
  onReply,
  chatList,
  groupId,
  readReceipt,
}) => {
  const dispatch = useAppDispatch();

  /* Selecotrs */
  const filesBytes = useSelector((state: RootState) => state.groups.groupFiles);
  const {
    messages: stateMessages,
    errMsgs: groupErrMessages,
    pinnedMessages,
  } = useSelector((state: RootState) => state.groups);
  const membersProfile = useSelector(
    (state: RootState) => state.groups.members
  );
  const profile = useSelector((state: RootState) => state.profile);

  /* LOCAL STATE */
  const [messages, setMessages] = useState<GroupMessageBundle[]>([]);
  const [messagesReceipt, setMessagesReceipt] = useState<string[]>([]);
  const [oldestFetched, setOldestFetched] = useState<boolean>(false);

  /* REFs */
  const receiptsTimeout = useRef<NodeJS.Timeout>();

  /* Handlers */
  const handleOnScrollTop = (complete: any) => {
    const lastMessage = messages[0];

    if (!oldestFetched && lastMessage && !lastMessage.err) {
      dispatch(
        getPreviousGroupMessages({
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
    complete();
  };

  const handleOnDownload = (file: FilePayload) => {
    const fileBytes = filesBytes[file.fileHash!];

    if (fileBytes) {
      const blob = new Blob([fileBytes]); // change resultByte to bytes
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.fileName;
      link.click();
    } else {
      dispatch(fetchFilesBytes([file.fileHash!])).then(
        (res: { [key: string]: Uint8Array }) => {
          if (res && Object.keys(res).length > 0) {
            const fetchedFileBytes = res[file.fileHash!];
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

  const [readData, setReadData] = useState<GroupMessageReadData[]>([]);

  useEffect(() => {
    if (readData.length > 0) {
      if (receiptsTimeout.current) clearTimeout(receiptsTimeout.current);
      receiptsTimeout.current = setTimeout(() => {
        const first = readData[0];
        const readListData: GroupMessageReadData = {
          ...first,
          messageIds: readData.map((item) => item.messageIds).flat(),
        };
        dispatch(readGroupMessage(readListData));
        setReadData([]);
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readData]);

  const handleOnSeen = (complete: () => any, message: any) => {
    if (readReceipt) {
      const read: boolean = Object.keys(message.readList).includes(profile.id!);

      if (!read) {
        // setReadData((currReadData) => ({
        //   ...currReadData!,
        //   messageIds: [...currReadData!.messageIds, message.groupMessageId],
        // }));

        const groupMessageReadData: GroupMessageReadData = {
          groupId: groupId,
          messageIds: [message.groupMessageId],
          reader: profile.id!,
          timestamp: message.timestamp,
          members,
        };
        setReadData((currReadData) => [...currReadData, groupMessageReadData]);
        complete();
      }
    }
  };

  const handleOnRetry = (setLoading: any, message: GroupMessageBundle) => {
    const errMsg: GroupMessageInput = {
      groupId: message.groupId,
      payloadInput: isTextPayload(message.payload)
        ? {
            type: "TEXT",
            payload: {
              payload: message.payload.payload.payload,
            },
          }
        : {
            type: "FILE",
            payload: {
              metadata: {
                fileName: message.payload.fileName,
                fileSize: message.payload.fileSize,
                fileType: message.payload.fileType,
              },
              fileType:
                message.payload.fileType === "IMAGE"
                  ? {
                      type: "IMAGE",
                      payload: {
                        thumbnail: message.payload.thumbnail!,
                      },
                    }
                  : message.payload.fileType === "VIDEO"
                  ? {
                      type: "VIDEO",
                      payload: {
                        thumbnail: message.payload.thumbnail!,
                      },
                    }
                  : { type: "OTHER" },
              fileBytes: message.payload.fileBytes!,
            },
          },
      sender: message.author.id,
      replyTo: message.replyToId,
    };
    setLoading(true);
    // display loading button
    // retry sending the group message
    dispatch(sendGroupMessage(errMsg)).then((res: GroupMessage | false) => {
      setLoading(false);
      if (!res) return null;
      dispatch(removeErrGroupMessage(message));
    });
  };

  /* Effects */

  useEffect(() => {
    const messages = dispatch(getMessagesWithProfile(messageIds, groupId));
    messages.sort((x: any, y: any) => {
      return x.timestamp.getTime() - y.timestamp.getTime();
    });

    setMessages(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIds, stateMessages, groupErrMessages]);

  // debounce and read messages
  useEffect(() => {
    if (messagesReceipt.length > 0) {
      if (receiptsTimeout.current) clearTimeout(receiptsTimeout.current);
      receiptsTimeout.current = setTimeout(() => {
        const groupMessageReadData: GroupMessageReadData = {
          groupId: groupId,
          messageIds: messagesReceipt,
          reader: profile.id!,
          timestamp: new Date(),
          members,
        };
        dispatch(readGroupMessage(groupMessageReadData)).then((res: any) => {
          setMessagesReceipt([]);
        });
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesReceipt]);

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
                profile={message.author}
                onDownload={handleOnDownload}
                onDelete={() => dispatch(removeErrGroupMessage(message))}
                onRetry={(setLoading: any) =>
                  handleOnRetry(setLoading, message)
                }
                key={i}
                isPinned={pinnedMessages[message.groupMessageId] ? true : false}
                timestamp={message.timestamp}
                payload={message.payload}
                readList={message.readList}
                onPinMessage={() => {
                  if (pinnedMessages[message.groupMessageId])
                    dispatch(unpinMessage(groupId, message.groupMessageId));
                  else dispatch(pinMessage(groupId, message.groupMessageId));
                }}
                replyTo={
                  message.replyTo
                    ? {
                        payload: message.replyTo!.payload,
                        author: {
                          id: membersProfile[message.replyTo!.author].id,
                          username:
                            membersProfile[message.replyTo!.author].username,
                          fields:
                            membersProfile[message.replyTo!.author].fields,
                        },
                        id: `${i}`,
                      }
                    : undefined
                }
                type="group"
                showName={true}
                showProfilePicture={true}
                onReply={(message) => onReply(message)}
                err={message.err}
              />
            );
          return (
            <Chat.Others
              id={message.groupMessageId}
              profile={message.author}
              onDownload={handleOnDownload}
              key={i}
              isPinned={pinnedMessages[message.groupMessageId] ? true : false}
              onPinMessage={() => {
                if (pinnedMessages[message.groupMessageId])
                  dispatch(unpinMessage(groupId, message.groupMessageId));
                else dispatch(pinMessage(groupId, message.groupMessageId));
              }}
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
                        fields: membersProfile[message.replyTo!.author].fields,
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

export default ChatBox;
