import { IonContent, IonList, IonPage } from "@ionic/react";
import React from "react";
import Conversation from "../../components/Conversation";
import Toolbar from "../../components/Toolbar";
import { Conversations as ConversationsType } from "../../utils/types";
import styles from "./style.module.css";

const conversations: ConversationsType = [
  {
    id: "1",
    name: "Akira",
    messages: [
      {
        id: "2",
        sender: "Akira",
        message: "Last message",
        timestamp: new Date(),
      },
      {
        id: "1",
        sender: "seulgibear",
        message: "Yo what's up",
        timestamp: new Date(),
      },
      {
        id: "32",
        sender: "seulgibear",
        message: "Test message",
        timestamp: new Date(),
      },
      {
        id: "14",
        sender: "seulgibear",
        message:
          "I'm composing this message to 'simulate' a long message just to see if the spacing and whatnots are correct lmao wtf",
        timestamp: new Date(),
      },
      {
        id: "1",
        sender: "Akira",
        message:
          "I'm composing this message to 'simulate' a long message just to see if the spacing and whatnots are correct lmao wtf",
        timestamp: new Date(),
      },
    ],
    src:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg",
  },
  {
    id: "1",
    name: "Beyonder",
    messages: [
      {
        id: "1",
        sender: "Neil",
        timestamp: new Date(),
        message:
          "Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up ",
      },
    ],
    sender: "Neil",
    src:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg",
  },
];

const Conversations: React.FC = () => {
  return (
    <IonPage>
      <Toolbar onChange={() => {}} />
      <IonContent>
        <IonList className={styles.conversation}>
          {conversations.map((conversation) => (
            <Conversation
              key={JSON.stringify(conversation)}
              content={conversation}
            />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Conversations;
