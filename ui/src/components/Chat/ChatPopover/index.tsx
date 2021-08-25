import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { arrowUndoOutline, pin } from "ionicons/icons";
import React from "react";
import { IntlShape } from "react-intl";
import styles from "./style.module.css";

interface Props {
  onPin(): any;
  onReply(): any;
  isPinned: boolean;
  intl: IntlShape;
  onHide(): any;
}

const ChatPopover: React.FC<Props> = ({
  onPin,
  onReply,
  isPinned,
  intl,
  onHide,
}) => {
  return (
    <IonList>
      <IonItem
        button
        lines="none"
        onClick={() => {
          onReply();
          onHide();
        }}
      >
        <IonLabel>
          {intl.formatMessage({ id: "components.chat.chat-modal-reply" })}
        </IonLabel>
        <IonIcon icon={arrowUndoOutline} className={styles["icon"]} />
      </IonItem>

      <IonItem
        onClick={() => {
          onPin();
          onHide();
        }}
        button
        lines="none"
      >
        <IonLabel>
          {isPinned
            ? intl.formatMessage({ id: "components.chat.chat-modal-unpin" })
            : intl.formatMessage({ id: "components.chat.chat-modal-pin" })}
        </IonLabel>
        <IonIcon icon={pin} slot="end" />
      </IonItem>
    </IonList>
  );
};

export default ChatPopover;
