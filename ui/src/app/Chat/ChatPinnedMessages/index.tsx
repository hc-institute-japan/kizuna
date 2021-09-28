import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import PinnedMessages from "../../../components/PinnedMessages";
import { getPinnedMessages } from "../../../redux/p2pmessages/actions/getPinnedMessages";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";

const ChatPinnedMessage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getPinnedMessages(id));
  }, []);

  const messages: any[] = useSelector((state: RootState) => {
    const conversation = state.p2pmessages.conversations[id];
    if (conversation) {
      if (
        conversation.pinned &&
        !(
          conversation.pinned.filter((id) => !state.p2pmessages.pinned).length >
          0
        )
      ) {
        return conversation.pinned.map((id) => {
          const pinnedMessage = state.p2pmessages.pinned[id];

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
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton defaultHref={`/u/${id}`}></IonBackButton>
            <IonTitle>
              {intl.formatMessage({
                id: "app.chat.pinned-message-title",
              })}
            </IonTitle>
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
