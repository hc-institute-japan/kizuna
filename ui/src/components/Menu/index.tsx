import {
  IonContent,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonMenu,
} from "@ionic/react";
import { banOutline, cogOutline, logOutOutline } from "ionicons/icons";
import React, { useRef } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isHoloEnv } from "../../connection/constants";
import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import Identicon from "../Identicon";
import styles from "./style.module.css";
import { client } from "../../connection/holochainClient";
import { useAppDispatch } from "../../utils/helpers";
import { logout } from "../../redux/profile/actions";

interface MenuItem {
  onClick(): any;
  label: string;
  icon: string;
  disabled?: boolean;
}

const Menu: React.FC = () => {
  const history = useHistory();
  const { username, id } = useSelector((state: RootState) => state.profile);
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const menu = useRef<any>(null);

  const menuList: MenuItem[] = [
    {
      onClick: () => {
        history.push("/settings");
      },
      label: intl.formatMessage({ id: "app.menu.settings-label" }),
      icon: cogOutline,
    },
    {
      onClick: () => {
        history.push("/blocked");
      },
      label: intl.formatMessage({ id: "app.menu.blocked-label" }),
      icon: banOutline,
    },
    {
      onClick: () => {
        // const c = (client as any).connection;
        // await c.signOut();
        // await c.signIn();
        dispatch(logout());
        history.push("/");
      },
      label: intl.formatMessage({ id: "app.menu.logout-label" }),
      icon: logOutOutline,
      disabled: isHoloEnv() ? false : true,
    },
  ];

  const handleOnClick = () => {
    menu?.current?.close();
    history.push({
      pathname: `/p/${id}`,
      state: { profile: { username, id } as Profile },
    });
  };

  return (
    <IonMenu ref={menu} contentId="main" type="overlay">
      <IonContent className={`${styles.menu} ion-padding-top`}>
        <IonList id="inbox-list" lines="none">
          <IonItemGroup className="ion-no-margin">
            <span className={`${styles["container"]} ion-margin`}>
              {/* <IonAvatar className="ion-margin-start">
                <img
                  className={styles.avatar}
                  alt="Your user"
                  src={personCircleOutline}
                ></img>
              </IonAvatar> */}
              <Identicon hash={id!} size={50} />
            </span>
            <IonItem onClick={handleOnClick} lines="none">
              <IonLabel>{username}</IonLabel>
            </IonItem>
          </IonItemGroup>
          {menuList.map(({ onClick, label, icon, disabled = false }) => (
            <IonItem
              key={label}
              onClick={() => {
                menu?.current?.close();
                onClick();
              }}
              disabled={disabled}
            >
              <IonIcon className="ion-margin-end" icon={icon} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
