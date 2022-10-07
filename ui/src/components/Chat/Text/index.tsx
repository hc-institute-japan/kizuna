import { IonText, IonImg } from "@ionic/react";
import React from "react";
import { TextPayload } from "../../../redux/commons/types";
import styles from "./style.module.css";

interface Props {
  message: TextPayload;
  type: "me" | "others";
}

const Text: React.FC<Props> = ({ message, type }) => {
  const linkExp = new RegExp("https://media.tenor.com/*/*.gif");
  const match = linkExp.test(message.payload.payload);

  return !match ? (
    <IonText className={styles[type === "me" ? "me" : "others"]}>
      {message.payload.payload}
    </IonText>
  ) : (
    <IonImg src={message.payload.payload} />
  );
};

export default Text;
