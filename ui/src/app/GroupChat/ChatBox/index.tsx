import React, { useEffect, useState } from "react";
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
  errMsgs: GroupMessageInput[];
  setErrMsgs: React.Dispatch<React.SetStateAction<GroupMessageInput[]>>;
}
const MessageList: React.FC<Props> = ({
  messageIds,
  members,
  onReply,
  chatList,
  groupId,
  readReceipt,
  errMsgs,
  setErrMsgs,
}) => {
  const dispatch = useAppDispatch();

  /* Selecotrs */
  const filesBytes = useSelector((state: RootState) => state.groups.groupFiles);
  const groupMessages = useSelector(
    (state: RootState) => state.groups.messages
  );

  /* LOCAL STATE */
  const [messages, setMessages] = useState<GroupMessageBundle[]>([]);
  const [oldestFetched, setOldestFetched] = useState<boolean>(false);

  const {
    messages: stateMessages,
    members: stateMembers,
    pinnedMessages,
  } = useSelector((state: RootState) => state.groups);
  const membersProfile = useSelector(
    (state: RootState) => state.groups.members
  );
  const profile = useSelector((state: RootState) => state.profile);

  /* Handlers */
  const handleOnScrollTop = (complete: any) => {
    if (!oldestFetched) {
      let lastMessage = messages[0];
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
    return null;
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

  const handleOnSeen = (complete: () => any, message: any) => {
    if (readReceipt) {
      const read: boolean = Object.keys(message.readList).includes(profile.id!);

      if (!read) {
        const groupMessageReadData: GroupMessageReadData = {
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
    }
  };

  const handleDeleteErr = (message: GroupMessageBundle) => {
    if (message.err) {
      let errMsg: GroupMessageInput = {
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
      let errMsgStringified = errMsgs.map((errMsg) => JSON.stringify(errMsg));
      let messageStringified = messages.map((message) =>
        JSON.stringify(message)
      );
      let iOfErr = errMsgStringified.indexOf(JSON.stringify(errMsg));
      let iOfMsg = messageStringified.indexOf(JSON.stringify(message));
      let newErrMsgs = errMsgs;
      let newMsgs = messages;
      if (iOfErr > -1) {
        newErrMsgs.splice(iOfErr, 1);
      }
      if (iOfMsg > -1) {
        newMsgs.splice(iOfMsg, 1);
      }
      setMessages([...newMsgs]);
      setErrMsgs([...newErrMsgs]);
    }
  };

  /* Effects */

  useEffect(() => {
    const messages = dispatch(getMessagesWithProfile(messageIds));
    if (errMsgs.length !== 0) {
      errMsgs.forEach((errMsg) => {
        let payload: Payload | null;
        if (isTextPayload(errMsg.payloadInput)) {
          payload = {
            type: "TEXT",
            payload: { payload: errMsg.payloadInput.payload.payload },
          };
        } else {
          payload = {
            type: "FILE",
            fileName: errMsg.payloadInput.payload.metadata.fileName,
            fileSize: errMsg.payloadInput.payload.metadata.fileSize,
            fileType: errMsg.payloadInput.payload.fileType.type,
            fileBytes: errMsg.payloadInput.payload.fileBytes,
            thumbnail: errMsg.payloadInput.payload.fileType.payload?.thumbnail,
          };
        }
        let msg: GroupMessageBundle = {
          groupMessageId: "error message", // TODO: use a unique id
          groupId: errMsg.groupId,
          author: { id: profile.id!, username: profile.username! },
          payload: payload,
          timestamp: new Date(),
          replyTo:
            errMsg.replyTo && groupMessages[errMsg.replyTo]
              ? {
                  groupId: groupMessages[errMsg.replyTo].groupId,
                  author: groupMessages[errMsg.replyTo].author,
                  payload: groupMessages[errMsg.replyTo].payload,
                  timestamp: groupMessages[errMsg.replyTo].timestamp,
                  replyTo: undefined,
                  readList: groupMessages[errMsg.replyTo].readList,
                }
              : undefined, // TODO: change this to display reply message
          replyToId: errMsg.replyTo ? errMsg.replyTo : undefined,
          readList: {},
          err: true,
        };
        messages.push(msg);
      });
    }

    messages.sort((x: any, y: any) => {
      return x.timestamp.getTime() - y.timestamp.getTime();
    });

    setMessages(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIds, stateMessages, errMsgs]);

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
                onDelete={() => {
                  handleDeleteErr(message);
                }}
                onRetry={(errMsg: GroupMessageInput, setLoading: any) => {
                  setLoading(true);
                  // display loading button
                  // send the group message
                  dispatch(sendGroupMessage(errMsg)).then(
                    (res: GroupMessage | false) => {
                      setLoading(false);
                      if (!res) return null;
                      handleDeleteErr(message);
                    }
                  );
                }}
                key={i}
                author={message.author.username}
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
                errMsg={
                  message.err
                    ? {
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
                      }
                    : undefined
                }
              />
            );
          return (
            <Chat.Others
              id={message.groupMessageId}
              onDownload={handleOnDownload}
              key={i}
              isPinned={pinnedMessages[message.groupMessageId] ? true : false}
              onPinMessage={() => {
                if (pinnedMessages[message.groupMessageId])
                  dispatch(unpinMessage(groupId, message.groupMessageId));
                else dispatch(pinMessage(groupId, message.groupMessageId));
              }}
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
