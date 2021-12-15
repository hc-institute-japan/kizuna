import {
  IonAvatar,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonLabel,
  IonList,
  IonMenu,
  IonText,
  IonToolbar,
} from "@ionic/react";
import {
  banOutline,
  cogOutline,
  logOutOutline,
  warningOutline,
} from "ionicons/icons";
import React, { useRef } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { isHoloEnv } from "../../connection/constants";
import { logout } from "../../redux/profile/actions";
import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import Identicon from "../Identicon";
import styles from "./style.module.css";

interface MenuItem {
  onClick(): any;
  label: string;
  icon: string;
  disabled?: boolean;
}

const Menu: React.FC = () => {
  const history = useHistory();
  const { username, id, fields } = useSelector((state: RootState) => {
    return { ...state.profile };
  });

  const intl = useIntl();
  const dispatch = useAppDispatch();
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
      onClick: () =>
        window.open(
          "https://github.com/hc-institute-japan/kizuna/issues/new?assignees=&labels=bug&template=bug_report.md&title="
        ),
      label: intl.formatMessage({ id: "app.menu.report-label" }),
      icon: warningOutline,
    },
    {
      onClick: () => {
        // const c = (client as any).connection;
        // await c.signOut();
        // await c.signIn();
        dispatch(logout());
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
      state: { profile: { username, id, fields } as Profile, prev: `/home` },
    });
  };

  return (
    <IonMenu ref={menu} contentId="main" type="overlay">
      <IonContent className={`${styles.menu} ion-padding-top`}>
        <IonList id="inbox-list" lines="none">
          <IonItemGroup className="ion-no-margin">
            <div className={`${styles.container} ion-padding`}>
              {fields.avatar ? (
                <IonAvatar>
                  <img src={fields.avatar} alt="avatar"></img>
                </IonAvatar>
              ) : (
                <Identicon hash={id!} size={60} />
              )}
            </div>

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
      <IonFooter className="ion-no-border">
        <IonToolbar>
          <IonText className={`ion-padding ${styles["version"]}`}>
            {intl.formatMessage({ id: "app.menu.version" })} 0.2.0
          </IonText>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  );
};

export default Menu;
