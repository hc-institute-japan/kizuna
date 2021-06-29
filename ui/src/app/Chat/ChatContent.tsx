import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  arrowBackSharp,
  informationCircleOutline,
  personCircleOutline,
  search,
} from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router";
import AgentIdentifier from "../../components/AgentIdentifier";
import { ChatList, Me, Others } from "../../components/Chat";
import { ChatListMethods } from "../../components/Chat/types";
import Typing from "../../components/Chat/Typing";
import MessageInput, {
  MessageInputMethods,
} from "../../components/MessageInput";
import { FilePayload } from "../../redux/commons/types";
import {
  getFileBytes,
  getNextBatchMessages,
  isTyping,
  readMessage,
  sendMessage,
} from "../../redux/p2pmessages/actions";
import {
  P2PHashMap,
  P2PMessage,
  P2PMessageReceipt,
} from "../../redux/p2pmessages/types";
import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import styles from "./style.module.css";

const Chat: React.FC = () => {
  /* STATES */
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<string>("");
  const [messagesWithConversant, setMessagesWithConversant] = useState<any[]>(
    []
  );
  const [disableGetNextBatch, setDisableGetNextBatch] =
    useState<boolean>(false);
  const { conversations, messages, receipts } = useSelector(
    (state: RootState) => state.p2pmessages
  );
  const fetchedFiles = useSelector(
    (state: RootState) => state.p2pmessages.files
  );
  const typing = useSelector((state: RootState) => state.p2pmessages.typing);
  const conversant = useSelector((state: RootState) => {
    const contacts = state.contacts.contacts;
    const conversant = Object.values(contacts).filter(
      (contact) => contact.id === id
    );
    return conversant[0];
  });

  const dispatch = useAppDispatch();
  const history = useHistory();
  const { pathname, state }: { pathname: string; state: { username: string } } =
    useLocation();

  /* REFS */
  const scrollerRef = useRef<ChatListMethods>(null);
  const didMountRef = useRef(false);
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
    if (
      conversant !== undefined &&
      conversations[conversant.id] !== undefined &&
      Object.keys(messages).length > 0
    ) {
      let filteredMessages = conversations[conversant.id].messages.map(
        (messageID) => {
          let message = messages[messageID]; // this is undefined
          let receiptIDs = message.receipts;
          let filteredReceipts = receiptIDs.map((id) => {
            let receipt = receipts[id];
            return receipt;
          });
          filteredReceipts.sort((a: any, b: any) => {
            let receiptTimestampA = a.timestamp.getTime();
            let receiptTimestampB = b.timestamp.getTime();
            if (receiptTimestampA > receiptTimestampB) return -1;
            if (receiptTimestampA < receiptTimestampB) return 1;
            return 0;
          });
          let latestReceipt = filteredReceipts[0];
          return { message: message, receipt: latestReceipt };
        }
      );
      filteredMessages.sort((x, y) => {
        return x.message.timestamp.getTime() - y.message.timestamp.getTime();
      });
      setMessagesWithConversant(filteredMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, messages, receipts, conversant]);

  /* HANDLERS */
  /* 
    navigates to info, media, files page 
    when clicking the name of the conversant on the top toolbar 
  */
  const handleOnClick = () => {
    history.push({
      pathname: `${pathname}/details`,
      state: { conversant: conversant },
    });
  };

  /*
    dispatches an typing indicator when the user types.
    call typing indicator with false parameter with debounce of 500ms as well.
  */
  const handleOnChange = (message: string, conversant: Profile) => {
    if (didMountRef.current === true) {
      dispatch(isTyping(conversant.id, message.length !== 0 ? true : false));

      if (inputTimeout.current) clearTimeout(inputTimeout.current);

      inputTimeout.current = setTimeout(
        () => dispatch(isTyping(conversant.id, false)),
        500
      );

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
  const handleOnSubmit = () => {
    if (message !== "") {
      dispatch(
        sendMessage(
          conversant.id,
          message,
          "TEXT",
          replyTo !== "" ? replyTo : undefined
        )
      );
    }

    files.forEach((file) =>
      setTimeout(
        dispatch(
          sendMessage(
            conversant.id,
            message,
            "FILE",
            replyTo !== "" ? replyTo : undefined,
            file
          )
        ),
        3000
      )
    );

    scrollerRef.current!.scrollToBottom();

    setReplyTo("");
  };

  /* 
      disptaches an action to hc to get the next batch of older messages
      when reaching the beginning/top of the chat box
    */
  const handleOnScrollTop = (complete: any) => {
    if (didMountRef.current === true) {
      if (disableGetNextBatch === false) {
        let lastMessage = messagesWithConversant[0].message;
        dispatch(
          getNextBatchMessages(
            conversant.id,
            5,
            "All",
            lastMessage.timestamp,
            lastMessage.p2pMessageEntryHash
          )
        ).then((res: P2PHashMap) => {
          // disable getNextBatch if return value is empty
          if (Object.values(res)[0][conversant.id].length <= 0) {
            setDisableGetNextBatch(true);
          }
          complete();
        });
      }
    } else {
      didMountRef.current = true;
    }
    return;
  };

  /*
      Handle back button
    */
  const handleOnBack = () => history.push({ pathname: `/home` });

  /* 
      dispatches an action to hc to mark a message as read 
      which emits a signal to the sender
      when the chat bubble comes into view
    */
  const onSeenHandler = (messageBundle: {
    message: P2PMessage;
    receipt: P2PMessageReceipt;
  }) => {
    if (messageBundle.receipt.status !== "read") {
      dispatch(readMessage([messageBundle.message]));
    }
  };

  /* 
    downloads a file when already in redux state
    if not, dispatches an action to get the file from hc
    when clicking the file download button
  */
  const onDownloadHandler = (file: FilePayload) => {
    fetchedFiles[file.fileHash] !== undefined
      ? downloadFile(fetchedFiles[file.fileHash], file.fileName)
      : dispatch(getFileBytes([file.fileHash])).then(
          (res: { [key: string]: Uint8Array }) => {
            if (res && Object.keys(res).length > 0) {
              downloadFile(res[file.fileHash], file.fileName);
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
    renders the appropriate chat bubble
  */
  const displayMessage = (messageBundle: {
    message: P2PMessage;
    receipt: P2PMessageReceipt;
  }) => {
    // assume that this will be called with messages in sorted order
    let key = messageBundle.message.p2pMessageEntryHash;
    let author = messageBundle.message.author;
    let timestamp = messageBundle.receipt.timestamp;
    let payload = messageBundle.message.payload;
    let readlist =
      messageBundle.receipt.status === "read" ? { key: timestamp } : undefined;
    let replyToData = messageBundle.message.replyTo
      ? {
          payload: messageBundle.message.replyTo.payload,
          author: messageBundle.message.replyTo.author,
          id: messageBundle.message.replyTo.p2pMessageEntryHash,
        }
      : null;
    if (
      payload.type === "FILE" &&
      (payload as FilePayload).fileType === "VIDEO" &&
      fetchedFiles[payload.fileHash] === undefined
    ) {
      dispatch(getFileBytes([payload.fileHash]));
    }

    return conversant.id !== author.id ? (
      <Me
        id={messageBundle.message.p2pMessageEntryHash}
        key={key}
        type="p2p"
        author={author.username}
        timestamp={timestamp}
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
      />
    ) : (
      <Others
        id={messageBundle.message.p2pMessageEntryHash}
        key={key}
        type="p2p"
        author={author.username}
        timestamp={timestamp}
        payload={payload}
        readList={readlist ? readlist : {}}
        showProfilePicture={true}
        showName={true}
        onSeen={(complete) => onSeenHandler(messageBundle)}
        onDownload={(file) => onDownloadHandler(file)}
        replyTo={replyToData ? replyToData : undefined}
        onReply={(message) => {
          if (messageInputRef.current) messageInputRef?.current?.reply(message);
          setReplyTo(message.id);
        }}
      />
    );
  };

  /* RENDER */
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton
              onClick={() => handleOnBack()}
              className="ion-no-padding"
            >
              <IonIcon slot="icon-only" icon={arrowBackSharp} />
            </IonButton>
            <IonAvatar className="ion-padding">
              <img
                className={styles["avatar"]}
                src={personCircleOutline}
                alt={state?.username}
              />
            </IonAvatar>
            <IonTitle className="item item-text-wrap">
              <AgentIdentifier nickname={state?.username} id={id} />
            </IonTitle>
            <IonButton
              onClick={() => history.push(`/u/${conversant.id}/search`)}
            >
              <IonIcon slot="icon-only" icon={search} />
            </IonButton>
            <IonButton onClick={handleOnClick}>
              <IonIcon slot="icon-only" icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ChatList
          type="p2p"
          onScrollTop={(complete) => handleOnScrollTop(complete)}
          ref={scrollerRef}
          disabled={disableGetNextBatch}
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
