import {
  IonAvatar,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  IonButton,
  IonText
} from "@ionic/react";
import React, { useEffect, useState, useRef } from "react";
import { RouteComponentProps, useHistory, useLocation, useParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { sendMessage, getNextBatchMessages } from "../../redux/p2pmessages/actions";
import { ChatList, Me, Others } from "../../components/Chat";
import MessageInput from "../../components/MessageInput";
import { useAppDispatch, base64ToUint8Array, dateToTimestamp } from "../../utils/helpers";
import { Conversation } from "../../utils/types";
import { ChatListMethods } from "../../components/Chat/types";
import { personCircleOutline } from "ionicons/icons";

type Props = {
  location: RouteComponentProps<{}, {}, { state: Conversation }>
};

const Chat: React.FC<Props> = ({ location }) => {
  const [ data, setData ] = useState<Conversation | null>(null);
  const { username } = useParams<{ username: string }>();
  const conversant = useSelector((state: RootState) => {
    let contacts = state.contacts.contacts;
    let conversant = Object.values(contacts).filter(contact => contact.username == username);
    return conversant[0];
  });

  const { conversations, messages, receipts } = useSelector((state: RootState) => state.p2pmessages);
  const [ lastSent, setLastSent ] = useState<any>(null);
  const [ lastDelivered, setLastDelivered ] = useState<any>(null);
  const [ lastRead, setLastRead ] = useState<any>(null);

  const [ transConversations, setTransConversations ] = useState<any[]>([]);

  const [message, setMessage] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);

  // const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const dispatch = useAppDispatch();
  const history = useHistory();
  const location2 = useLocation();

  const scroller = useRef<ChatListMethods>(null);

  useEffect(() => {
    const { state }: any = { ...location };
    if (state) {
      setData(state);
    } else {
    }
  }, [location]);

  useEffect(() => {
    scroller.current!.scrollToBottom();
  }, [])
  
  useEffect(() => {
    if (conversant !== undefined && conversations[("u" + conversant.id)] !== undefined) {
      let filteredMessages = Object.values(conversations[("u" + conversant.id)].messages).map((messageID) => {
        let message = messages[messageID];
        let receiptIDs = message.receipts;
        let filteredReceipts = receiptIDs.map((id) => {
          let receipt = receipts[id];
          return receipt
        });
    
        filteredReceipts.sort((a: any, b: any) => {
          let receiptTimestampA = a.timeReceived.getTime();
          let receiptTimestampB = b.timeReceived.getTime();
          if (receiptTimestampA > receiptTimestampB) return -1;
          if (receiptTimestampA < receiptTimestampB) return 1;
          return 0;
        });
    
        let latestReceipt = filteredReceipts[0];
        
        const { status: latestReceiptStatus, timestamp: latestReceiptTimestamp } = Object(latestReceipt);
        switch (latestReceiptStatus) {
          case "sent":
            if (lastSent === null || lastSent.timestamp.getTime() < latestReceiptTimestamp.getTime()) {
              setLastSent({messageID: messageID, timestamp: latestReceiptTimestamp, receipt: latestReceipt})
            }
            break
          case "delivered":
            if (lastDelivered === null || lastDelivered.timestamp.getTime() < latestReceiptTimestamp.getTime()) {
              setLastDelivered({messageID: messageID, timestamp: latestReceiptTimestamp, receipt: latestReceipt})
            }
            break
          case "read":
            if (lastRead === null || lastRead.timestamp.getTime() < latestReceiptTimestamp.getTime()) {
              setLastRead({messageID: messageID, timestamp: latestReceiptTimestamp, receipt: latestReceipt})
            }
            break
          default:
            break
        };
  
        return { message: message, receipt: latestReceipt }
      });
      
      setTransConversations(filteredMessages.reverse());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, messages, receipts]);

  const handleOnClick = () => {
    history.push({
      pathname: `${location2.pathname}/details`,
      state: { conversant: conversant }
    })
  }

  const displayStatus = (messageID: string) => {
    var ret;
    if (lastSent != null && messageID === lastSent.messageID) ret = <IonText>{"Sent " + lastSent.timestamp}</IonText>;
    if (lastDelivered != null && messageID === lastDelivered.messageID) ret = <IonText>{"Delivered " + lastDelivered.timestamp}</IonText>;
    if (lastRead != null && messageID === lastRead.messageID) ret = <IonText>{"Read " + lastRead.timestamp}</IonText>;
    return ret
  };

  const handleOnScrollTop = (complete: any, messages: any) => {
    let lastMessage = transConversations[0].message;
    dispatch(
      getNextBatchMessages({
        conversant: Buffer.from(base64ToUint8Array(conversant.id)),
        batch_size: 5,
        payload_type: "All",
        last_fetched_timestamp: dateToTimestamp(lastMessage.timestamp),
        last_fetched_message_id: Buffer.from(base64ToUint8Array(lastMessage.p2pMessageEntryHash.slice(1)))
      })
    )
    complete()
    return
  }

  const scrollRef = React.createRef<HTMLIonInfiniteScrollElement>();

  const displayMessage = (messageBundle: any) => {
    if (conversant.id !== messageBundle.message.author) {
      return (
        <Me 
          key={messageBundle.message.p2pMessageEntryHash}
          type="p2p"
          author={messageBundle.message.author}
          timestamp={messageBundle.receipt.timestamp}
          payload={messageBundle.message.payload}
          readList={{ conversant: messageBundle.message.timeSent }}
          showProfilePicture={true}
          showName={true}
        />
      )
    } else {
      return (
        <Others
          key={messageBundle.message.p2pMessageEntryHash}
          type="p2p"
          author={messageBundle.message.author}
          timestamp={messageBundle.receipt.timestamp}
          payload={messageBundle.message.payload}
          readList={{ conversant: messageBundle.receipt.timestamp}}
          showProfilePicture={true}
          showName={true}
        />
      )
    }
  }

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
        ))
    });

    // send the message if any
    if (message !== "") {
      dispatch(
        sendMessage(
          Buffer.from(base64ToUint8Array(conversant.id)), 
          message, 
          "TEXT",
          undefined, 
          )
        )
        .then(setLoading(false)
      );
    }
    
    scroller.current!.scrollToBottom();

  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" className="ion-no-padding" />
            <IonAvatar className="ion-padding">
              <img src={personCircleOutline} alt={username} />
            </IonAvatar>
            {/* <IonButton href={`/u/${username}/details`} fill="clear" onClick={handleOnClick}> */}
            <IonButton fill="clear" onClick={handleOnClick}>
              <IonTitle className="ion-no-padding">{username}</IonTitle>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ChatList 
          type="p2p"
          onScrollTop={(complete) => handleOnScrollTop(complete, transConversations)}
          ref={scroller}
        >
          { transConversations.map((messageBundle) => displayMessage(messageBundle)) }
        </ChatList>
      </IonContent>

      <MessageInput
        onSend={handleOnSubmit}
        onChange={(message) => setMessage(message)}
        onFileSelect={(files) => setFiles(files)}
      />
    </IonPage>
  );
};

export default Chat;
