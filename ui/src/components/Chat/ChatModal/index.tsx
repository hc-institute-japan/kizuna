import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
} from "@ionic/react";
import { arrowUndoOutline, pinOutline } from "ionicons/icons";
import React, { SetStateAction } from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

interface Props {
  open: [boolean, React.Dispatch<SetStateAction<boolean>>];
  onReply: () => any;
  onPin: () => any;
  onCopy?: () => any;
  isPinned: boolean;
}

const ChatModal: React.FC<Props> = ({
  open,
  onReply,
  onPin,
  onCopy,
  isPinned,
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = open;

  return (
    <IonModal
      cssClass={styles.modal}
      isOpen={isOpen}
      onDidDismiss={() => {
        setIsOpen(false);
      }}
    >
      <IonContent className={styles["content"]}>
        <IonList>
          <IonItem
            button
            lines="none"
            onClick={() => {
              onReply();
              setIsOpen(false);
            }}
          >
            <IonLabel>
              {intl.formatMessage({ id: "components.chat.chat-modal-reply" })}
            </IonLabel>
            <IonIcon icon={arrowUndoOutline} className={styles["icon"]} />
          </IonItem>
          <IonItem
            button
            lines="none"
            onClick={() => {
              onPin();
              setIsOpen(false);
            }}
          >
            <IonLabel>
              {isPinned
                ? intl.formatMessage({ id: "components.chat.chat-modal-unpin" })
                : intl.formatMessage({ id: "components.chat.chat-modal-pin" })}
            </IonLabel>
            <IonIcon icon={pinOutline} className={styles["icon"]} />
          </IonItem>
          {onCopy ? (
            <IonItem
              button
              lines="none"
              onClick={() => {
                onCopy();
                setIsOpen(false);
              }}
            >
              <IonLabel>
                {intl.formatMessage({ id: "components.chat.chat-modal-copy" })}
              </IonLabel>
              <IonIcon icon={arrowUndoOutline} className={styles["icon"]} />
            </IonItem>
          ) : null}
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default ChatModal;
