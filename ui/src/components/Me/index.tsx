import { IonText } from "@ionic/react";
import React from "react";
import { Payload, TextPayload, isTextPayload } from "../../redux/commons/types";
import { P2PMessage, P2PMessageReceipt } from "../../redux/p2pmessages/types";
import styles from "./style.module.css";

interface Props {
  message: Payload;
}

const Me: React.FC<Props> = ({ message }) => {
  return (
    <div className={styles.me}>
      {isTextPayload(message) ? (
        <IonText>{(message as TextPayload).payload.payload}</IonText>
       ) : null}
    </div>
  );
};

export default Me;
