import {
  IonAvatar,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from "@ionic/react";
import React, { useEffect, useState, useRef } from "react";
import {
  RouteComponentProps,
  useHistory,
  useLocation,
  useParams,
} from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { Conversation } from "../../utils/types";
import { ChatListMethods } from "../../components/Chat/types";
import { personCircleOutline } from "ionicons/icons";
import { P2PMessage, P2PMessageReceipt } from "../../redux/p2pmessages/types";
import { 
  sendMessage, 
  getNextBatchMessages, 
  readMessage, 
  isTyping, 
  getFileBytes
} from "../../redux/p2pmessages/actions";
import {
  useAppDispatch,
  base64ToUint8Array,
  dateToTimestamp,
  debounce,
} from "../../utils/helpers";
import { ChatList, Me, Others } from "../../components/Chat";
import Typing from "../../components/Chat/Typing";
import MessageInput from "../../components/MessageInput";
import styles from "./style.module.css";
import { FilePayload } from "../../redux/commons/types";

type Props = {
  location: RouteComponentProps<{}, {}, { state: Conversation }>;
};

const Chat: React.FC<Props> = ({ location }) => {
  const [message, setMessage] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);
  const [transConversations, setTransConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { username } = useParams<{ username: string }>();
  const { conversations, messages, receipts } = useSelector(
    (state: RootState) => state.p2pmessages
  );
  const conversant = useSelector((state: RootState) => {
    let contacts = state.contacts.contacts;
    let conversant = Object.values(contacts).filter(
      (contact) => contact.username == username
    );
    return conversant[0];
  });
  const typing = useSelector((state:RootState) => state.p2pmessages.typing);
  const fetchedFiles = useSelector((state: RootState) => state.p2pmessages.files);

  const dispatch = useAppDispatch();
  const history = useHistory();
  const location2 = useLocation();

  /* REFS */
  const scroller = useRef<ChatListMethods>(null);
  const scrollRef = React.createRef<HTMLIonInfiniteScrollElement>();

  /* USE EFFECTS */
  /* scroll the chat box to bottom when opening */
  useEffect(() => {
    scroller.current!.scrollToBottom();
  }, []);

  /* filter messages from conversant and sort receipt */
  useEffect(() => {
    if (
      conversant !== undefined &&
      conversations["u" + conversant.id] !== undefined
    ) {
      let filteredMessages = Object.values(
        conversations["u" + conversant.id].messages
      ).map((messageID) => {
        let message = messages[messageID];
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
      });
      setTransConversations(filteredMessages.reverse());
    }
  }, [conversations, messages, receipts]);

  /* issue a dispatch to ask the holochain who is typing */
  useEffect(() => {
    if (conversant) {
      debounce(
        dispatch(
          isTyping(Buffer.from(base64ToUint8Array(conversant.id)), true)
        ),
        5000
      );
    }
  }, [message]);

  /* HANDLERS */
  const handleOnClick = () => {
    history.push({
      pathname: `${location2.pathname}/details`,
      state: { conversant: conversant },
    });
  };

  const handleOnSubmit = () => {
    setLoading(true);
    files.forEach((file) => {
      dispatch(
        sendMessage(
          Buffer.from(base64ToUint8Array(conversant.id)),
          message,
          "FILE",
          undefined,
          file
        )
      );
    });

    if (message !== "") {
      dispatch(
        sendMessage(
          Buffer.from(base64ToUint8Array(conversant.id)),
          message,
          "TEXT",
          undefined
        )
      );
    }

    setLoading(false);
    scroller.current!.scrollToBottom();
  };

  const handleOnScrollTop = (complete: any, messages: any) => {
    let lastMessage = transConversations[0].message;
    dispatch(
      getNextBatchMessages({
        conversant: Buffer.from(base64ToUint8Array(conversant.id)),
        batch_size: 5,
        payload_type: "All",
        last_fetched_timestamp: dateToTimestamp(lastMessage.timestamp),
        last_fetched_message_id: Buffer.from(
          base64ToUint8Array(lastMessage.p2pMessageEntryHash.slice(1))
        ),
      })
    );
    complete();
    return;
  };

  const onSeenHandler = (messageBundle: {
    message: P2PMessage;
    receipt: P2PMessageReceipt;
  }) => {
    if (messageBundle.receipt.status != "read") {
      dispatch(readMessage([messageBundle.message]));
    }
  };

  const downloadFile = (fileBytes: Uint8Array, fileName: string) => {
    const blob = new Blob([fileBytes]); // change resultByte to bytes  
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };
  
  const onDownloadHandler = (file: FilePayload) => {
    fetchedFiles["u" + file.fileHash] != undefined
    ? downloadFile(fetchedFiles["u" + file.fileHash], file.fileName)
    : dispatch(getFileBytes([base64ToUint8Array(file.fileHash)]))
      .then((res: {[key:string]: Uint8Array}) => downloadFile(res["u" + file.fileHash], file.fileName))
  }

  const displayMessage = (messageBundle: { message: P2PMessage, receipt: P2PMessageReceipt}) => {
    // assume that this will be called in sorted order

    let key = messageBundle.message.p2pMessageEntryHash;
    let author = messageBundle.message.author;
    let timestamp = messageBundle.receipt.timestamp;
    let payload = messageBundle.message.payload;
    let readlist =
      messageBundle.receipt.status == "read" ? { key: timestamp } : undefined;
    return conversant.id != author.slice(1) ? (
      <Me
        key={key}
        type="p2p"
        author={author}
        timestamp={timestamp}
        payload={payload}
        readList={readlist ? readlist : {}}
        showProfilePicture={true}
        showName={true}
        onDownload={file => onDownloadHandler(file)}
      />
    ) : (
      <Others
        key={key}
        type="p2p"
        author={author}
        timestamp={timestamp}
        payload={payload}
        readList={readlist ? readlist : {}}
        showProfilePicture={true}
        showName={true}
        onSeen={(complete) => onSeenHandler(messageBundle)}
        onDownload={file => onDownloadHandler(file)}
      />
    );
  };

  /* RENDER */
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" className="ion-no-padding" />
            <IonAvatar className="ion-padding">
              <img src={personCircleOutline} alt={username} />
            </IonAvatar>
            <IonButton fill="clear" onClick={handleOnClick}>
              <IonTitle className="ion-no-padding">{username}</IonTitle>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ChatList
          type="p2p"
          onScrollTop={(complete) =>
            handleOnScrollTop(complete, transConversations)
          }
          ref={scroller}
        >
          {transConversations.map((messageBundle) =>
            displayMessage(messageBundle)
          )}
        </ChatList>
      </IonContent>

      <Typing profiles={Object.values(typing)}></Typing>

      <MessageInput
        onSend={handleOnSubmit}
        onChange={(message) => setMessage(message)}
        onFileSelect={(files) => setFiles(files)}
      />
    </IonPage>
  );
};

export default Chat;
