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
  contact: ProfileType;
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
    setProfile(state.contact);
  }, [state?.contact]);

  return (
    <IonPage>
      <IonHeader
        style={{
          backgroundImage: `url("https://instagram.fmnl3-2.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/153183681_221786689635197_8533112046939022296_n.jpg?tp=1&_nc_ht=instagram.fmnl3-2.fna.fbcdn.net&_nc_cat=105&_nc_ohc=aiSb_B85lnsAX_ZSkr8&oh=485389a978d593f60ac1e88dd01d326a&oe=60649831")`,
        }}
        className={styles.header}
      >
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

      <ProfileInfo id={state.contact.id} nickname={state.contact.username} />
    </IonPage>
  );
};

export default Profile;
