import { IonContent, IonItem, IonList, IonModal, IonLabel } from "@ionic/react";
import React, { SetStateAction } from "react";
import { Message } from "../../../redux/commons/types";
import { GroupMessage } from "../../../redux/group/types";
import { P2PMessage } from "../../../redux/p2pmessages/types";
import styles from "./style.module.css";

interface Props {
  open: [boolean, React.Dispatch<SetStateAction<boolean>>];
  onReply: () => any;
}

const ChatModal: React.FC<Props> = ({ open, onReply }) => {
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
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default ChatModal;
