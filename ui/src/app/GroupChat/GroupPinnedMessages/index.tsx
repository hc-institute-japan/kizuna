import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useState } from "react";
import { useParams } from "react-router";
import PinnedMessages from "../../../components/PinnedMessages";
import { Payload } from "../../../redux/commons/types";

const GroupPinnedMessages: React.FC = () => {
  const { group } = useParams<{ group: string }>();
  const [data, _setData] = useState<
    { id: string; author: string; payload: Payload; date: Date }[]
  >([
    {
      id: "1",
      author: "Neil",
      payload: {
        type: "TEXT",
        payload: { payload: "Hello" },
      },
      date: new Date(),
    },
    {
      id: "2",
      author: "Neil",
      payload: {
        type: "TEXT",
        payload: {
          payload:
            "Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello Hello ",
        },
      },
      date: new Date(),
    },
  ]);
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
        <PinnedMessages
          onMessageClick={(message) => {
            console.log(message);
          }}
          messages={data}
        />
      </IonContent>
    </IonPage>
  );
};

export default GroupPinnedMessages;
