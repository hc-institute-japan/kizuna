import { IonText } from "@ionic/react";
import React from "react";
import { Message } from "../../utils/types";
import styles from "./style.module.css";

interface Props {
  message: Message;
}

const Others: React.FC<Props> = ({ message }) => {
  return (
    <div className={`${styles.others} `}>
      <IonText>{message.message}</IonText>
    </div>
  );
};

export default Others;
