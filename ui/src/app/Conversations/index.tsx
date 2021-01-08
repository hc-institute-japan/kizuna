import {
  IonContent,
  IonList,


  IonPage,
  IonTab
} from "@ionic/react";
import React from "react";
import Conversation from "../../components/Conversation";
import Toolbar from "../../components/Toolbar";
import { Conversations as ConversationsType } from "../../utils/types";
import styles from "./style.module.css";


const conversations: ConversationsType = [
  {
    id: '1',
    name: "Akira",
    messages: [{ id: '1', sender: 'Akira', message: "Yo what's up" }],
    src:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg",
  },
  {
    id: '1',
    name: "Beyonder",
    messages:
      [{ id: '1', sender: 'Neil', message: "Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up " }],
    sender: "Neil",
    src:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg",
  },
];

const Conversations: React.FC = () => {

  return (
    <IonPage>
      <Toolbar />
      <IonContent>
        <IonList className={styles.conversation}>
          {conversations.map((conversation) => (
            <Conversation
              key={JSON.stringify(conversation)}
              src={conversation.src}
              sender={conversation.sender}
              name={conversation.name}
              message={conversation.messages[0].message}
            ></Conversation>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Conversations;
