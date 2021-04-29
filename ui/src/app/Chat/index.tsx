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
import { AgentPubKey } from "@holochain/conductor-api";
import React, { useEffect, useState, useRef } from "react";
import { RouteComponentProps, useHistory, useLocation, useParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { Conversation } from "../../utils/types";
import { Profile } from "../../redux/profile/types";
import { ChatListMethods } from "../../components/Chat/types";
import { personCircleOutline } from "ionicons/icons";
import { P2PMessage, P2PMessageReceipt } from "../../redux/p2pmessages/types";
import { fetchId } from "../../redux/profile/actions";
import { sendMessage, getNextBatchMessages, readMessage, isTyping } from "../../redux/p2pmessages/actions";
import { useAppDispatch, base64ToUint8Array, Uint8ArrayToBase64, dateToTimestamp } from "../../utils/helpers";
import { ChatList, Me, Others } from "../../components/Chat";
import Typing from "../../components/Chat/Typing";
import MessageInput from "../../components/MessageInput";
import styles from "./style.module.css";

type Props = {
  location: RouteComponentProps<{}, {}, { state: Conversation }>
};

const Chat: React.FC<Props> = ({ location }) => {
  const [ myID, setMyID ] = useState<AgentPubKey | null>(null);
  const [ data, setData ] = useState<Conversation | null>(null);
  const [ message, setMessage ] = useState<string>("");
  const [ files, setFiles ] = useState<any[]>([]);
  const [ transConversations, setTransConversations ] = useState<any[]>([]);
  const [ loading, setLoading ] = useState<boolean>(false);
  const { username } = useParams<{ username: string }>();
  const { conversations, messages, receipts } = useSelector((state: RootState) => state.p2pmessages);
  const conversant = useSelector((state: RootState) => {
    let contacts = state.contacts.contacts;
    let conversant = Object.values(contacts).filter(contact => contact.username == username);
    return conversant[0];
  });
  const typing = useSelector((state:RootState) => state.p2pmessages.typing);
  

  const dispatch = useAppDispatch();
  const history = useHistory();
  const location2 = useLocation();
  
  // REFS
  const scroller = useRef<ChatListMethods>(null);
  const scrollRef = React.createRef<HTMLIonInfiniteScrollElement>();

  // USE EFFECTS
  useEffect(() => {
    scroller.current!.scrollToBottom();
  }, [])

  useEffect(() => {
    dispatch(fetchId()).then((res: AgentPubKey | null) => {
      if (res) setMyID(res);
    });
  }, [])

  useEffect(() => {
    const { state }: any = { ...location };
    if (state) {
      setData(state);
    } else {
    }
  }, [location]);

  useEffect(() => {
    // console.log("Chat conv", conversations);
    // console.log("Chat mess", messages);
    // console.log("Chat rece", receipts);

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
        return { message: message, receipt: latestReceipt }
      });
      
      setTransConversations(filteredMessages.reverse());
    }
  }, [conversations, messages]);

  useEffect(() => {
    if (conversant) {
      dispatch(isTyping(Buffer.from(base64ToUint8Array(conversant.id)), true))
    }
  }, [message])

  // HANDLERS
  const handleOnClick = () => {
    history.push({
      pathname: `${location2.pathname}/details`,
      state: { conversant: conversant }
    })
  };

  const handleOnSubmit = () => {
    files.forEach((file) => {
      setLoading(true);
      dispatch(
        sendMessage(
          Buffer.from(base64ToUint8Array(conversant.id)), 
          message, 
          "FILE",
          undefined,
          file
        ))
        .then(setLoading(false));
    });

    if (message !== "") {
      setLoading(true);
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
    complete();
    return
  };

  // const onChangeHandler = ((message: string) => {
  //   setMessage(message);
  //   console.log("change handler", base64ToUint8Array(conversant.id), conversant)
  //   dispatch(isTyping(Buffer.from(base64ToUint8Array(conversant.id)), true));
  // })

  const displayMessage = (messageBundle: { message: P2PMessage, receipt: P2PMessageReceipt}) => {
    // assume that this will be called in sorted order

    let key = messageBundle.message.p2pMessageEntryHash;
    let author = messageBundle.message.author;
    let timestamp = messageBundle.receipt.timestamp;
    let payload = messageBundle.message.payload;
    let readlist = messageBundle.receipt.status == "read" 
      ? { key: timestamp } 
      : undefined
    return conversant.id != author.slice(1)
    ? <Me 
        key={key}
        type="p2p"
        author={author}
        timestamp={timestamp}
        payload={payload}
        readList={readlist ? readlist : {}}
        showProfilePicture={true}
        showName={true}
      />
    : <Others
        key={key}
        type="p2p"
        author={author}
        timestamp={timestamp}
        payload={payload}
        readList={readlist ? readlist : {}}
        showProfilePicture={true}
        showName={true}
        onSeen={(complete) => {
          dispatch(readMessage([messageBundle.message]))
        }}
      />
  };


  // RENDER
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
