import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonPage,
} from "@ionic/react";
import { add } from "ionicons/icons";
import React, { useState } from "react";
import Conversation from "../../components/Conversation";
import Toolbar from "../../components/Toolbar";
import { Conversations as ConversationsType } from "../../utils/types";
import NewChatModal from "./NewChatModal";
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
          "Hey, this is James. We met at Sandra’s party on Saturday, and she gave me your number",
        timestamp: new Date(),
      },
      {
        id: "1",
        sender: "Akira",
        message:
          "Hey, Jane! I was going to watch that movie you recommended, but I can’t think of the name. Do you remember what it’s called?",
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
  const [isOpen, setIsOpen] = useState(false);

  const handleOnClick = () => {
    setIsOpen(true);
  };

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
        <NewChatModal isOpen={isOpen} onCancel={() => setIsOpen(false)} />
        <IonFab vertical="bottom" horizontal="end">
          <IonFabButton>
            <IonIcon icon={add} onClick={handleOnClick} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Conversations;
