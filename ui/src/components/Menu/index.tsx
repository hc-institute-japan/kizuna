import {
  IonAvatar,
  IonContent,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonMenu,
} from "@ionic/react";
import { banOutline, cogOutline, logOutOutline, peopleCircleOutline, personCircle, personCircleOutline, personCircleSharp } from "ionicons/icons";
import React, { useRef } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { setUsername } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import styles from "./style.module.css";

interface MenuItem {
  onClick(): any;
  label: string;
  icon: string;
}

const Menu: React.FC = () => {
  const history = useHistory();
  const { username } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch();
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
        dispatch(setUsername(null));
        history.push("/");
      },
      label: intl.formatMessage({ id: "app.menu.logout-label" }),
      icon: logOutOutline,
    },
  ];

  return (
    <IonMenu ref={menu} contentId="main" type="overlay">
      <IonContent className={`${styles.menu} ion-padding-top`}>
        <IonList id="inbox-list" lines="none">
          <IonItemGroup className="ion-no-margin">
            <IonAvatar className="ion-margin">
              <img
                className={styles.avatar}
                alt="Your user"
                src={personCircleSharp}
              ></img>
            </IonAvatar>

            <IonItem lines="none">
              <IonLabel>{username}</IonLabel>
            </IonItem>
          </IonItemGroup>
          {menuList.map(({ onClick, label, icon }) => (
            <IonItem
              key={label}
              onClick={() => {
                menu?.current?.close();
                onClick();
              }}
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
