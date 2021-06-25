import { IonButtons, IonBackButton, IonToolbar } from "@ionic/react";
import React from "react";
import AgentIdentifier from "../../../../components/AgentIdentifier";
import { Profile } from "../../../../redux/profile/types";
import styles from "../style.module.css";

interface Props {
  profile: Profile;
}

/*
	displays the header and name of conversant in ChatDetails
*/
const ContactHeader: React.FC<Props> = ({ profile }) => {
  return (
    <div>
      <IonToolbar className={styles.controls}>
        <span>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={`/u/${profile.id}`}
              className="ion-no-padding"
            />
          </IonButtons>
        </span>
      </IonToolbar>

      <div className={styles.titlebar}>
        <p className={styles.title}>
          <AgentIdentifier nickname={profile.username} id={profile.id} />
        </p>
      </div>
    </div>
  );
};

export default ContactHeader;
