import { IonText } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import { TextPayload } from "../../../../redux/commons/types";
import styles from "./style.module.css";

interface Props {
  message: TextPayload;
  timestamp: Date;
}

const MeText: React.FC<Props> = ({ message, timestamp }) => {
  const intl = useIntl();
  return (
    <div className={`${styles.me} ${styles.text}`}>
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

export default MeText;
