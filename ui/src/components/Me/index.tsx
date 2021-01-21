import { IonText } from "@ionic/react";
import React from "react";
import { Message } from "../../utils/types";
import styles from "./style.module.css";

interface Props {
  message: Message;
}

const Me: React.FC<Props> = ({ message }) => {
  return (
    <div className={styles.me}>
      <IonText>{message.message}</IonText>
    </div>
  );
};

export default Me;
