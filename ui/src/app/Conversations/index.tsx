import {
  IonContent,
  IonIcon,
  IonList,
  IonPage,
  IonRouterOutlet,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import React from "react";
import Conversation from "../../components/Conversation";
import Toolbar from "../../components/Toolbar";
import styles from "./style.module.css";
import { person, call, settings } from "ionicons/icons";

const conversations = [
  {
    name: "Akira",
    message: "Yo what's up",
    src:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg",
  },
  {
    name: "Beyonder",
    message:
      "Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up Yo what's up ",
    sender: "Neil",
    src:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg",
  },
];

const Conversations: React.FC = () => {
  console.log("conversations");
  return (
    <IonTab tab="conversations">
      <IonList className={styles.conversation}>
        {conversations.map((conversation) => (
          <Conversation
            key={JSON.stringify(conversation)}
            src={conversation.src}
            sender={conversation.sender}
            name={conversation.name}
            message={conversation.message}
          ></Conversation>
        ))}
      </IonList>
    </IonTab>
  );
};

export default Conversations;
