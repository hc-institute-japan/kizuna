import { IonText } from "@ionic/react";
import React from "react";
import { TextPayload } from "../../../redux/commons/types";
import styles from "./style.module.css";

interface Props {
  message: TextPayload;
  type: "me" | "others";
}

const Text: React.FC<Props> = ({ message, type }) => {
  return (
    <IonText className={styles[type === "me" ? "me" : "others"]}>
      {message.payload.payload}
    </IonText>
  );
};

export default Text;
