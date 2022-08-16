import { IonButton, IonButtons, IonIcon, IonToolbar } from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import React from "react";
import { useHistory } from "react-router";
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
  const history = useHistory();
  return (
    <div>
      <IonToolbar className={styles.controls}>
        <span>
          <IonButtons slot="start">
            <IonButton
              onClick={() => history.push({ pathname: `/u/${profile.id}` })}
              className="ion-no-padding"
            >
              <IonIcon slot="icon-only" icon={arrowBackSharp} />
            </IonButton>
          </IonButtons>
        </span>
      </IonToolbar>

      <div className={styles.titlebar}>
        <div className={styles.title}>
          <AgentIdentifier
            displayId={false}
            nickname={profile.username}
            id={profile.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactHeader;
