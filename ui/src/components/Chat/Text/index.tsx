import { IonText } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";

import common from "../style.module.css";
import { TextPayload } from "../../../redux/commons/types";

interface Props {
  message: TextPayload;
  timestamp: Date;
  type: "me" | "others";
}

const OthersText: React.FC<Props> = ({ message, timestamp, type }) => {
  const intl = useIntl();
  return (
    <div className={`${common[type]} ${common.text} ${common.bubble}`}>
      <IonText>
        <p className="ion-no-margin">{message.payload.payload}</p>
      </IonText>
      <IonText>
        <h6 className="ion-no-margin ion-text-end">
          {intl.formatTime(timestamp)}
        </h6>
      </IonText>
    </div>
  );
};

export default OthersText;
