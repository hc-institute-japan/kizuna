import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import PinnedMessages from "../../../components/PinnedMessages";
import { Payload } from "../../../redux/commons/types";
import { fetchPinnedMessages } from "../../../redux/group/actions/fetchPinnedMessages";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";

const GroupPinnedMessages: React.FC = () => {
  const { group } = useParams<{ group: string }>();

  const data:
    | { id: string; author: string; payload: Payload; date: Date }[]
    | null = useSelector((state: RootState) => {
    if (state.groups.conversations[group])
      return state.groups.conversations[group].pinnedMessages
        ? state.groups.conversations[group].pinnedMessages!.map(
            (pinnedMessageId) => {
              const pinnedMessage =
                state.groups.pinnedMessages[pinnedMessageId];

              return {
                id: pinnedMessageId,
                payload: pinnedMessage.payload,
                author: pinnedMessage.author,
                date: pinnedMessage.timestamp,
              };
            }
          )
        : [];
    return null;
  });
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!data) dispatch(fetchPinnedMessages(group));
  }, [data]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton defaultHref={`/g/${group}`}></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {data ? (
          <PinnedMessages
            type="group"
            onMessageClick={(message) => {}}
            messages={data}
          />
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default GroupPinnedMessages;
