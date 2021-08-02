import { IonContent, IonItem, IonLabel, IonList, IonModal } from "@ionic/react";
import React, { SetStateAction } from "react";
import styles from "./style.module.css";

interface Props {
  open: [boolean, React.Dispatch<SetStateAction<boolean>>];
  onReply: () => any;
  onPin: () => any;
  isPinned: boolean;
}

const ChatModal: React.FC<Props> = ({ open, onReply, onPin, isPinned }) => {
  const [isOpen, setIsOpen] = open;
  return (
    <IonModal
      cssClass={styles.modal}
      isOpen={isOpen}
      onDidDismiss={() => {
        setIsOpen(false);
      }}
    >
      <IonContent>
        <IonList>
          <IonItem
            button
            lines="none"
            onClick={() => {
              onReply();
              setIsOpen(false);
            }}
          >
            <IonLabel>Reply</IonLabel>
          </IonItem>
          <IonItem
            button
            lines="none"
            onClick={() => {
              onPin();
              setIsOpen(false);
            }}
          >
            <IonLabel>{isPinned ? "Unpin" : "Pin"}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default ChatModal;
