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
import PinnedMessage from "../../../components/PinnedMessage";

const ChatPinnedMessage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getPinnedMessages(id));
  }, []);

  const messages: any[] = useSelector(
    (state: RootState) => {
      const conversation = state.p2pmessages.conversations[id];
      if (conversation) {
        if (
          conversation.pinned &&
          !(
            conversation.pinned.filter((id) => !state.p2pmessages.pinned)
              .length > 0
          )
        ) {
          return conversation.pinned.map((id) => {
            const pinnedMessage = state.p2pmessages.pinned[id];
            console.log(pinnedMessage);
            return {
              id: pinnedMessage.p2pMessageEntryHash,
              payload: pinnedMessage.payload,
              author: pinnedMessage.author.username,
              date: pinnedMessage.timestamp,
            };
          });
        } else {
          dispatch(getPinnedMessages(id));
        }
      }
      return [];
    }
    // state.p2pmessages.conversations[id]
    //   ? state.p2pmessages.conversations[id].pinned
    //     ? state.p2pmessages.conversations[id].pinned
    //     : []
    //   : []
  );
  console.log(messages);

  // const allPinned: P2PMessage[] = useSelector((state: RootState) => {
  //   const allPinned: { [key: string]: P2PMessage } = state.p2pmessages.pinned;
  //   const filteredPinned = Object.values(allPinned).filter((message) =>
  //     pinnedIDs.includes(message.p2pMessageEntryHash)
  //   );
  //   return filteredPinned;
  // });

  // useEffect(() => {
  //   allPinned.map((message: P2PMessage) => {
  //     if (pinnedIDs.includes(message.p2pMessageEntryHash)) {
  //       if (messages[message.p2pMessageEntryHash] === undefined) {
  //         setMessages((currMessages) => ({
  //           [message.p2pMessageEntryHash]: {
  //             id: message.p2pMessageEntryHash,
  //             author: message.author.username,
  //             payload: message.payload,
  //             date: message.timestamp,
  //           },
  //         }));
  //       }
  //     }
  //   });
  //   // console.log("chatpinned messageIDs allPinned", pinnedIDs, allPinned);
  //   // console.log("chatpinned", messages);
  // }, [allPinned]);

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
