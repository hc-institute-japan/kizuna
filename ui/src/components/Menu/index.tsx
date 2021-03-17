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
import { banOutline, cogOutline, logOutOutline } from "ionicons/icons";
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
                alt="Your user"
                src="data:image/jpeg;base64,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"
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
