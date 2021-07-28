import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/types";
import { useParams } from "react-router";
import PinnedMessages from "../../../components/PinnedMessages";
import { Payload } from "../../../redux/commons/types";
import { P2PMessage } from "../../../redux/p2pmessages/types";
import { getPinnedMessages } from "../../../redux/p2pmessages/actions/getPinnedMessages";
import { useAppDispatch } from "../../../utils/helpers";

const ChatPinnedMessage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<{
    [key: string]: {
      id: string;
      author: string;
      payload: Payload;
      date: Date;
    };
  }>({});

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getPinnedMessages(id));
  }, []);

  const pinnedIDs = useSelector((state: RootState) =>
    state.p2pmessages.conversations[id]
      ? state.p2pmessages.conversations[id].pinned
        ? state.p2pmessages.conversations[id].pinned
        : []
      : []
  );

  const allPinned: P2PMessage[] = useSelector((state: RootState) => {
    const allPinned: { [key: string]: P2PMessage } = state.p2pmessages.pinned;
    const filteredPinned = Object.values(allPinned).filter((message) =>
      pinnedIDs.includes(message.p2pMessageEntryHash)
    );
    return filteredPinned;
  });

  useEffect(() => {
    allPinned.map((message: P2PMessage) => {
      if (pinnedIDs.includes(message.p2pMessageEntryHash)) {
        console.log("chappinned push to state");
        if (messages[message.p2pMessageEntryHash] === undefined) {
          messages[message.p2pMessageEntryHash] = {
            id: message.p2pMessageEntryHash,
            author: message.author.username,
            payload: message.payload,
            date: message.timestamp,
          };
        }
        // messages.push({

        // });
      }
    });
    console.log("chatpinned messageIDs allPinned", pinnedIDs, allPinned);
    console.log("chatpinned", messages);
  }, [allPinned]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton defaultHref={`/u/${id}`}></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <PinnedMessages
          onMessageClick={(message) => {}}
          messages={Object.values(messages)}
        />
      </IonContent>
    </IonPage>
  );
};

export default ChatPinnedMessage;
