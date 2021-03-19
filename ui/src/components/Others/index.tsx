import { IonText } from "@ionic/react";
import React from "react";
import { Payload, TextPayload, isTextPayload } from "../../redux/commons/types";
import styles from "./style.module.css";

interface Props {
  message: Payload;
}

const Others: React.FC<Props> = ({ message }) => {
  return (
    <div className={styles.others}>
      {isTextPayload(message) ? (
        <IonText>{(message as TextPayload).payload.payload}</IonText>
      ) : null}
    </div>
  );
};

export default Others;
