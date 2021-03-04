import {
  IonApp,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router";
import { fetchProfileFromUsername } from "../../redux/profile/actions";
import { Profile as ProfileType } from "../../redux/profile/types";
import { useAppDispatch } from "../../utils/helpers";
import ProfileMenuItems from "./ProfileMenuItems";
import styles from "./style.module.css";

interface LocationProps {
  prev: string;
  contact: ProfileType;
}

interface ParamsProps {
  username: string;
}

const Profile: React.FC = () => {
  const _isMounted = useRef(true);
  const location = useLocation<LocationProps>();
  const dispatch = useAppDispatch();
  const { username } = useParams<ParamsProps>();
  const [profile, setProfile] = useState<null | ProfileType>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    _isMounted.current = true;
    return () => {
      _isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (location?.state?.contact === undefined) {
      setLoading(true);
      dispatch(fetchProfileFromUsername(username)).then(
        (profile: ProfileType) => {
          if (_isMounted.current) {
            setLoading(false);
            setProfile(profile);
          }
        }
      );
    } else setProfile(location.state.contact);
  }, [dispatch, location?.state?.contact, username]);

  return (
    <IonApp>
      <IonHeader
        style={{
          backgroundImage: `url("https://instagram.fmnl3-2.fna.fbcdn.net/v/t51.2885-15/e35/p1080x1080/153183681_221786689635197_8533112046939022296_n.jpg?tp=1&_nc_ht=instagram.fmnl3-2.fna.fbcdn.net&_nc_cat=105&_nc_ohc=aiSb_B85lnsAX_ZSkr8&oh=485389a978d593f60ac1e88dd01d326a&oe=60649831")`,
        }}
        className={styles.header}
      >
        <IonToolbar>
          <IonButtons>
            <IonBackButton
              defaultHref={
                location?.state?.prev ? location.state.prev : "/home/contacts"
              }
            />
          </IonButtons>
          {profile ? <ProfileMenuItems profile={profile} /> : null}
        </IonToolbar>
        <IonToolbar className={styles["profile-toolbar"]}>
          <IonTitle>{profile ? profile.username : ""}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>{loading ? <IonSpinner></IonSpinner> : null}</IonContent>
    </IonApp>
  );
};

export default Profile;
