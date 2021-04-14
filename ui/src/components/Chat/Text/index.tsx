import { IonText } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import { TextPayload } from "../../../redux/commons/types";

interface Props {
  message: TextPayload;
  timestamp: Date;
  type: "me" | "others";
}

const Text: React.FC<Props> = ({ message, timestamp, type }) => {
  const intl = useIntl();
  return (
    <IonText>
      <p className="ion-no-margin">{message.payload.payload}</p>
    </IonText>
  );
};

export default Text;
