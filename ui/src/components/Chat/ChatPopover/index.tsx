import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import {
  arrowUndoOutline,
  closeCircleOutline,
  gitCompareOutline,
  pin,
} from "ionicons/icons";
import React from "react";
import { IntlShape } from "react-intl";
import styles from "./style.module.css";

interface Props {
  onPin(): any;
  onReply(): any;
  isPinned: boolean;
  intl: IntlShape;
  onHide(): any;
  onDelete(): any;
  onRetry(): any;
  err?: boolean;
}

const ChatPopover: React.FC<Props> = ({
  onPin,
  onReply,
  onDelete,
  isPinned,
  intl,
  onRetry,
  onHide,
  err,
}) => {
  const renderItems = () => (
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
  const renderErrItems = () => (
    <IonList>
      <IonItem
        button
        lines="none"
        onClick={() => {
          onRetry();
          onHide();
        }}
      >
        <IonLabel>
          {intl.formatMessage({ id: "components.chat.chat-modal-resend" })}
        </IonLabel>
        <IonIcon icon={gitCompareOutline} className={styles["icon"]} />
      </IonItem>

      <IonItem
        onClick={() => {
          onDelete();
          onHide();
        }}
        button
        lines="none"
      >
        <IonLabel>
          {intl.formatMessage({ id: "components.chat.chat-modal-delete" })}
        </IonLabel>
        <IonIcon icon={closeCircleOutline} slot="end" />
      </IonItem>
    </IonList>
  );
  return !err ? renderItems() : renderErrItems();
};

export default ChatPopover;
