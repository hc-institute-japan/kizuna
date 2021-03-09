import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { RootState } from "../../redux/types";
import MessageList from "./MessageList";

interface GroupChatParams {
  group: string;
}

const GroupConversation: React.FC = () => {
  const { group } = useParams<GroupChatParams>();
  const groupInfo = useSelector(
    (state: RootState) => state.groupConversations.conversations[group]
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton defaultHref="/home" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {groupInfo ? (
          <MessageList messageIds={groupInfo.messages}></MessageList>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default GroupConversation;
