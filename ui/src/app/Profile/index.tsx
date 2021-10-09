import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import ProfileInfo from "../../components/ProfileInfo";
import { Profile as ProfileType } from "../../redux/profile/types";
import ProfileMenuItems from "./ProfileMenuItems";
import styles from "./style.module.css";

interface LocationProps {
  prev: string;
  profile: ProfileType;
}

const Profile: React.FC = () => {
  const _isMounted = useRef(true);
  const { state } = useLocation<LocationProps>();
  const history = useHistory();
  const [profile, setProfile] = useState<null | ProfileType>(null);
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    _isMounted.current = true;
    return () => {
      _isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setProfile(state.profile);
  }, [state?.profile]);

  return (
    <IonPage>
      <IonHeader className={styles.header}>
        <IonToolbar>
          <IonButtons>
            <IonButton
              onClick={() => {
                console.log(state);
                history.push({
                  pathname: state?.prev ? state.prev : "/home/contacts",
                });
              }}
              className="ion-no-padding"
            >
              <IonIcon slot="icon-only" icon={arrowBackSharp} />
            </IonButton>
          </IonButtons>
          {profile ? <ProfileMenuItems profile={profile} /> : null}
        </IonToolbar>
        <IonToolbar className={styles["profile-toolbar"]}>
          <IonTitle className={styles["nickname"]}>
            {profile ? profile.username : ""}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <ProfileInfo id={state.profile.id} nickname={state.profile.username} />
    </IonPage>
  );
};

export default Profile;
