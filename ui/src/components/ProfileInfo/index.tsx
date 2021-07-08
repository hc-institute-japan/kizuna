import { IonItem, IonItemGroup, IonText, IonTextarea } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import Identicon from "../Identicon";
import styles from "./style.module.css";

interface Props {
  nickname: string;
  id: string;
}

const ProfileInfo: React.FC<Props> = ({ nickname, id }) => {
  const intl = useIntl();
  const trimmedId = id.slice(5);

  return (
    <>
      <IonItemGroup className={styles["container"]}>
        <IonItem lines="none">
          <h3>
            {intl.formatMessage({ id: "components.profile-info.nickname" })}
          </h3>
        </IonItem>

        <IonItem lines="none">
          <p>{nickname}</p>
        </IonItem>

        <IonItem lines="none">
          <h3>{intl.formatMessage({ id: "components.profile-info.id" })}</h3>
        </IonItem>

        <IonItem lines="none">
          <IonTextarea
            readonly
            className="ion-no-padding"
            value={trimmedId}
          ></IonTextarea>
        </IonItem>

        <IonItem lines="none">
          <h3>
            {intl.formatMessage({ id: "components.profile-info.identicon" })}
          </h3>
        </IonItem>
        <IonItem className={styles["avatar"]}>
          <Identicon hash={id} size={40} />
        </IonItem>
      </IonItemGroup>
    </>
  );
};

export default ProfileInfo;
