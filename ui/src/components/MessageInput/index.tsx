import {
  IonButton,
  IonButtons,
  IonFooter,
  IonIcon,
  IonTextarea,
  IonToolbar,
} from "@ionic/react";
import { attachOutline, camera, mic, send } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

interface Props {
  onChange?: (message: string) => any;
  onSend?: () => any;
}

const MessageInput: React.FC<Props> = ({ onChange, onSend }) => {
  const [message, setMessage] = useState("");
  const handleOnChange = (e: CustomEvent) => setMessage(e.detail.value!);
  const intl = useIntl();

  useEffect(() => {
    if (onChange) onChange(message);
  }, [message, onChange]);

  return (
    <IonFooter>
      <IonToolbar className={styles.toolbar}>
        <IonButtons slot="start">
          <IonButton>
            <IonIcon color="medium" icon={attachOutline} />
          </IonButton>
        </IonButtons>
        <IonTextarea
          onIonChange={handleOnChange}
          autoGrow={true}
          placeholder={intl.formatMessage({
            id: "app.new-conversation.message-placeholder",
          })}
        ></IonTextarea>
        <IonButtons slot="end">
          {message.length > 0 ? null : (
            <>
              <IonButton>
                <IonIcon color="medium" icon={camera} />
              </IonButton>
              <IonButton>
                <IonIcon color="medium" icon={mic} />
              </IonButton>
            </>
          )}
          <IonButton onClick={onSend} disabled={message.length === 0}>
            <IonIcon color="medium" icon={send} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonFooter>
  );
};

export default MessageInput;
