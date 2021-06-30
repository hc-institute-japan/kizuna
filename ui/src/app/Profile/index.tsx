import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
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
            <IonBackButton
              defaultHref={state?.prev ? state.prev : "/home/contacts"}
            />
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
