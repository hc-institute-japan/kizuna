import { IonContent, IonPage } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router";
import { ChatList, Me, Others } from "../../components/Chat";
import { ChatListMethods } from "../../components/Chat/types";
import Typing from "../../components/Chat/Typing";
import MessageInput, {
  FileContent,
  MessageInputMethods,
  MessageInputOnSendParams,
} from "../../components/MessageInput";
import { FilePayload } from "../../redux/commons/types";
import { fetchMyContacts } from "../../redux/contacts/actions";
import { getFileBytes } from "../../redux/p2pmessages/actions/getFileBytes";
import { getPreviousMessages } from "../../redux/p2pmessages/actions/getPreviousMessages";
import { getPinnedMessages } from "../../redux/p2pmessages/actions/getPinnedMessages";
import { getP2PState } from "../../redux/p2pmessages/actions/helpers/getP2PState";
import { isTyping } from "../../redux/p2pmessages/actions/isTyping";
// type imports
import { pinMessage } from "../../redux/p2pmessages/actions/pinMessage";
import { readMessage } from "../../redux/p2pmessages/actions/readMessage";
import removeErrMessage from "../../redux/p2pmessages/actions/removeErrMessage";
import { sendMessage } from "../../redux/p2pmessages/actions/sendMessage";
import { setErrorMessage } from "../../redux/p2pmessages/actions/setErrMessage";
import {
  P2PHashMap,
  P2PMessage,
  P2PMessageReceipt,
} from "../../redux/p2pmessages/types";
import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import ChatHeader from "./ChatHeader";
import recommitMessage from "../../redux/p2pmessages/actions/signals/recommitMessage";

const Chat: React.FC = () => {
  const dispatch = useAppDispatch();
  /* STATES */
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<string>("");
  const [files, setFiles] = useState<FileContent[]>([]);
  const [replyTo, setReplyTo] = useState<string>("");
  const [messagesWithConversant, setMessagesWithConversant] = useState<
    {
      message: P2PMessage;
      receipt?: P2PMessageReceipt | undefined;
    }[]
  >([]);
  const [messageReceipts, setMessageReceipts] = useState<P2PMessage[]>([]);
  const [disableGetPrevious, setDisableGetPrevious] = useState<boolean>(false);
  const {
    conversations,
    messages,
    receipts,
    errMsgs,
    files: fetchedFiles,
    pinned,
  } = useSelector((state: RootState) => state.p2pmessages);

  const typing = useSelector((state: RootState) => {
    const allTypingProfiles = state.p2pmessages.typing;
    const typingProfile = Object.values(allTypingProfiles).filter(
      (profile) => profile.id === id
    );
    return typingProfile;
  });
  const conversant = useSelector((state: RootState) => {
    const contacts = state.contacts.contacts;
    const conversant = Object.values(contacts).filter(
      (contact) => contact.id === id
    );
    return conversant[0];
  });
  const { readReceipt, typingIndicator } = useSelector(
    (state: RootState) => state.preference
  );

  const { pathname, state }: { pathname: string; state: { username: string } } =
    useLocation();

  const username = useSelector((rootState: RootState) => {
    if (state?.username) return state?.username;
    if (rootState.contacts?.contacts[id]?.username)
      return rootState.contacts?.contacts[id]?.username;

    fetchMyContacts();
    return "";
  });
  /* REFS */
  const scrollerRef = useRef<ChatListMethods>(null);
  const didMountRef = useRef(false);
  const receiptsTimeout = useRef<NodeJS.Timeout>();
  // const didMountRef2 = useRef(false);
  const inputTimeout = useRef<NodeJS.Timeout>();
  const messageInputRef = useRef<MessageInputMethods | null>(null);

  /* USE EFFECTS */
  /* 
      scrolls the conversation to the bottom 
      when opening a chat box
    */
  useEffect(() => {
    scrollerRef.current!.scrollToBottom();
  }, []);

  useEffect(() => {
    scrollerRef.current!.scrollToBottom();
  }, [conversant]);

  /* 
    filters messages with conversant and
    filters latest receipt/status
    when redux state of p2pmessages changes
  */
  useEffect(() => {
    if (conversant !== undefined) {
      dispatch(getP2PState(conversant)).then((res: any) =>
        setMessagesWithConversant(res)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, messages, receipts, conversant, errMsgs]);

  useEffect(() => {
    dispatch(getPinnedMessages(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce to dispatch readMessage
  useEffect(() => {
    if (messageReceipts.length > 0) {
      if (receiptsTimeout.current) clearTimeout(receiptsTimeout.current);
      receiptsTimeout.current = setTimeout(() => {
        dispatch(readMessage(messageReceipts));
        setMessageReceipts([]);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageReceipts]);

  /* HANDLERS */
  /*
    dispatches a typing indicator when the user types.
    call typing indicator with false parameter with debounce of 500ms as well.
  */
  const handleOnChange = (message: string, conversant: Profile) => {
    if (didMountRef.current === true) {
      if (typingIndicator) {
        dispatch(
          isTyping(
            conversant.id,
            message && message.length !== 0 ? true : false
          )
        );

        if (inputTimeout.current) clearTimeout(inputTimeout.current);

        inputTimeout.current = setTimeout(
          () => dispatch(isTyping(conversant.id, false)),
          500
        );
      }
      setMessage(message);
    } else {
      didMountRef.current = true;
    }
  };

  /* 
      dispatches an action to hc to send a message
      together with any file attached
      when clicking the send button  
    */
  const handleOnSubmit = (opt?: MessageInputOnSendParams) => {
    let { message: message2, setIsLoading } = { ...opt };
    setIsLoading!(true);
    if (message2 && message2 !== "") {
      dispatch(
        sendMessage(
          conversant.id,
          message2,
          "TEXT",
          replyTo !== "" ? replyTo : undefined
        )
      ).then((res: any) => {
        if (!res) {
          dispatch(
            setErrorMessage(
              conversant.id,
              message,
              "TEXT",
              replyTo !== "" ? replyTo : undefined
            )
          );
        }
        return files.length
          ? files.forEach((file) =>
              dispatch(
                sendMessage(
                  conversant.id,
                  message,
                  "FILE",
                  replyTo !== "" ? replyTo : undefined,
                  file
                )
              ).then((res: any) => {
                if (!res) {
                  dispatch(
                    setErrorMessage(
                      conversant.id,
                      message,
                      "FILE",
                      replyTo !== "" ? replyTo : undefined,
                      file
                    )
                  );
                }
                setIsLoading!(false);
              })
            )
          : setIsLoading!(false);
      });
    }

    if (message2 === "" && files.length) {
      files.forEach((file) =>
        dispatch(
          sendMessage(
            conversant.id,
            message,
            "FILE",
            replyTo !== "" ? replyTo : undefined,
            file
          )
        ).then((res: any) => {
          if (!res) {
            dispatch(
              setErrorMessage(
                conversant.id,
                message,
                "FILE",
                replyTo !== "" ? replyTo : undefined,
                file
              )
            );
          }
          setIsLoading!(false);
        })
      );
    }
    scrollerRef.current!.scrollToBottom();
    setReplyTo("");
  };

  /* 
      disptaches an action to hc to get the next batch of older messages
      when reaching the beginning/top of the chat box
    */
  const handleOnScrollTop = (complete: any) => {
    if (disableGetPrevious === false) {
      const lastMessage = messagesWithConversant[0]
        ? messagesWithConversant[0].message
        : null;
      if (lastMessage && !lastMessage.err) {
        dispatch(
          getPreviousMessages(
            conversant.id,
            5,
            "All",
            lastMessage.timestamp,
            lastMessage.p2pMessageEntryHash
          )
        ).then((res: P2PHashMap) => {
          // disable getPrevious if return value is empty
          if (res && Object.values(res)[0][conversant.id].length <= 0) {
            setDisableGetPrevious(true);
          }
          return complete();
        });
      }
    }
    return complete();
  };

  /* 
      dispatches an action to hc to mark a message as read 
      which emits a signal to the sender
      when the chat bubble comes into view
    */

  const onSeenHandler = (messageBundle: {
    message: P2PMessage;
    receipt?: P2PMessageReceipt;
  }) => {
    if (messageBundle.receipt!.status !== "read" && readReceipt) {
      // dispatch(readMessage([messageBundle.message]));
      setMessageReceipts((currMessageReceipts) => [
        ...currMessageReceipts,
        messageBundle.message,
      ]);
    }
  };

  /* 
    downloads a file when already in redux state
    if not, dispatches an action to get the file from hc
    when clicking the file download button
  */
  const onDownloadHandler = (file: FilePayload) => {
    fetchedFiles[file.fileHash!] !== undefined
      ? downloadFile(fetchedFiles[file.fileHash!], file.fileName)
      : dispatch(getFileBytes([file.fileHash!])).then(
          (res: { [key: string]: Uint8Array }) => {
            if (res && Object.keys(res).length > 0) {
              downloadFile(res[file.fileHash!], file.fileName);
            }
          }
        );
  };
  const downloadFile = (fileBytes: Uint8Array, fileName: string) => {
    const blob = new Blob([fileBytes]); // change resultByte to bytes
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  /* 
    handles retry of sending error message
  */
  const onRetryHandler = (setLoading: any, message: P2PMessage) => {
    setLoading(true);

    if (message.p2pMessageEntryHash === "error message") {
      if (message.payload.type === "TEXT") {
        dispatch(
          sendMessage(
            conversant.id,
            message.payload.payload.payload,
            "TEXT",
            message.replyToId
          )
        ).then((res: any) => {
          setLoading(false);
          if (!res) return null;
          dispatch(removeErrMessage(message));
        });
      } else {
        const file: FileContent = {
          metadata: {
            fileName: message.payload.fileName,
            fileType: message.payload.fileType,
            fileSize: message.payload.fileSize,
          },
          fileType: {
            type: message.payload.fileType,
            payload:
              message.payload.fileType === "OTHER"
                ? undefined
                : { thumbnail: message.payload.thumbnail! },
          },
          fileBytes: message.payload.fileBytes!,
        };
        dispatch(
          sendMessage(
            conversant.id,
            "",
            "FILE",
            replyTo !== "" ? replyTo : undefined,
            file
          )
        ).then((res: any) => {
          setLoading(false);
          if (!res) return null;
          dispatch(removeErrMessage(message));
        });
      }
    } else {
      dispatch(recommitMessage(message)).then((res: any) => setLoading(false));
    }
  };
  /* 
    renders the appropriate chat bubble
  */
  const displayMessage = (messageBundle: {
    message: P2PMessage;
    receipt?: P2PMessageReceipt;
  }) => {
    // assume that this will be called with messages in sorted order
    const key = messageBundle.message.p2pMessageEntryHash;
    const author = messageBundle.message.author;
    const payload = messageBundle.message.payload;
    const replyToData = messageBundle.message.replyTo
      ? {
          payload: messageBundle.message.replyTo.payload,
          author: messageBundle.message.replyTo.author,
          id: messageBundle.message.replyTo.p2pMessageEntryHash,
        }
      : null;

    const timestamp =
      messageBundle.message.err === undefined && messageBundle.receipt
        ? messageBundle.receipt!.timestamp
        : messageBundle.message.timestamp;

    const readlist = messageBundle.message.err
      ? undefined
      : messageBundle.receipt && messageBundle.receipt!.status === "read"
      ? { key: timestamp }
      : undefined;

    if (
      payload.type === "FILE" &&
      (payload as FilePayload).fileType === "VIDEO" &&
      fetchedFiles[payload.fileHash!] === undefined &&
      messageBundle.message.err === undefined
    ) {
      dispatch(getFileBytes([payload.fileHash!]));
    }

    return conversant.id !== author.id ? (
      <Me
        id={messageBundle.message.p2pMessageEntryHash}
        profile={messageBundle.message.author}
        key={key}
        type="p2p"
        timestamp={timestamp}
        onRetry={(setLoading) =>
          onRetryHandler(setLoading, messageBundle.message)
        }
        onDelete={() => dispatch(removeErrMessage(messageBundle.message))}
        payload={payload}
        readList={readlist ? readlist : {}}
        showProfilePicture={true}
        showName={true}
        onDownload={(file) => onDownloadHandler(file)}
        replyTo={replyToData ? replyToData : undefined}
        onReply={(message) => {
          if (messageInputRef.current) messageInputRef?.current?.reply(message);
          setReplyTo(message.id);
        }}
        onPinMessage={() => {
          dispatch(pinMessage([messageBundle.message]));
        }}
        isPinned={
          pinned[messageBundle.message.p2pMessageEntryHash] ? true : false
        }
        err={messageBundle.message.err}
      />
    ) : (
      <Others
        id={messageBundle.message.p2pMessageEntryHash}
        profile={messageBundle.message.author}
        key={key}
        type="p2p"
        timestamp={timestamp}
        payload={payload}
        readList={readlist ? readlist : {}}
        showProfilePicture={true}
        onPinMessage={() => dispatch(pinMessage([messageBundle.message]))}
        showName={true}
        // TODO: enable once conductor can handle many call_remotes
        // or once we have a better implementation.
        onSeen={(complete) => onSeenHandler(messageBundle)}
        // onSeen={(complete) => {}}
        onDownload={(file) => onDownloadHandler(file)}
        replyTo={replyToData ? replyToData : undefined}
        onReply={(message) => {
          if (messageInputRef.current) messageInputRef?.current?.reply(message);
          setReplyTo(message.id);
        }}
        isPinned={
          pinned[messageBundle.message.p2pMessageEntryHash] ? true : false
        }
      />
    );
  };

  /* RENDER */
  return (
    <IonPage>
      <ChatHeader
        id={id}
        pathname={pathname}
        conversant={conversant}
        username={username}
      />
      <IonContent>
        <ChatList
          type="p2p"
          onScrollTop={(complete) => handleOnScrollTop(complete)}
          // onScrollBottom={(complete) => {
          //   setTimeout(() => {
          //     complete();
          //   }, 2000);
          // }}
          ref={scrollerRef}
          disabled={disableGetPrevious}
        >
          {messagesWithConversant.map((messageBundle) =>
            displayMessage(messageBundle)
          )}
        </ChatList>
      </IonContent>

      <Typing profiles={Object.values(typing)}></Typing>

      <MessageInput
        ref={messageInputRef}
        onSend={handleOnSubmit}
        onChange={(message: string) => handleOnChange(message, conversant)}
        onFileSelect={(files) => setFiles(files)}
      />
    </IonPage>
  );
};

export default Chat;
