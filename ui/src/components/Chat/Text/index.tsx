import { IonText } from "@ionic/react";
import React from "react";
import { TextPayload } from "../../../redux/commons/types";

interface Props {
  message: TextPayload;
}

const Text: React.FC<Props> = ({ message }) => {
  return (
    <IonText>
      <p className="ion-no-margin">{message.payload.payload}</p>
    </IonText>
  );
};

export default Text;
