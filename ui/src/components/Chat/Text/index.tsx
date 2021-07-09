import { IonText } from "@ionic/react";
import React from "react";
import { TextPayload } from "../../../redux/commons/types";

interface Props {
  message: TextPayload;
}

const Text: React.FC<Props> = ({ message }) => {
  return <IonText>{message.payload.payload}</IonText>;
};

export default Text;
