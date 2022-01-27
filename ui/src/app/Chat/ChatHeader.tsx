import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  useIonPopover,
} from "@ionic/react";
import {
  arrowBackSharp,
  ellipsisVerticalOutline,
  informationCircleOutline,
  pin,
  search,
} from "ionicons/icons";
import React from "react";
import { IntlShape, useIntl } from "react-intl";
import { useHistory } from "react-router";
import AgentIdentifier from "../../components/AgentIdentifier";
import Identicon from "../../components/Identicon";
import { Profile } from "../../redux/profile/types";
import styles from "./style.module.css";

interface Props {
  id: string;
  username: string;
  pathname: string;
  conversant: Profile;
}

interface ChatMenuItemsProps {
  history: any;
  conversant: Profile;
  pathname: string;
  onHide(): any;
  intl: IntlShape;
}

const ChatMenuItems: React.FC<ChatMenuItemsProps> = ({
  history,
  conversant,
  onHide,
  pathname,
  intl,
}) => {
  return (
    <IonList>
      <IonItem
        button
        onClick={() => {
          onHide();
          history.push({
            pathname: `${pathname}/details`,
            state: { conversant },
          });
        }}
      >
        <IonIcon slot="start" icon={informationCircleOutline} />
        <IonLabel>
          {intl.formatMessage({ id: "app.chat.header-details" })}
        </IonLabel>
      </IonItem>
      <IonItem
        button
        onClick={() => {
          history.push({ pathname: `/u/${conversant.id}/search` });
          onHide();
        }}
      >
        <IonIcon slot="start" icon={search} />
        <IonLabel>
          {intl.formatMessage({ id: "app.chat.header-search" })}
        </IonLabel>
      </IonItem>
      <IonItem
        button
        onClick={() => {
          history.push({ pathname: `/u/${conversant.id}/pinned` });
          onHide();
        }}
      >
        <IonIcon slot="start" icon={pin} />
        <IonLabel>
          {intl.formatMessage({ id: "app.chat.header-pinned-messages" })}
        </IonLabel>
      </IonItem>
    </IonList>
  );
};
// {
//   <IonButton onClick={() => history.push(`/u/${conversant.id}/search`)}>
//             <IonIcon slot="icon-only" icon={search} />
//           </IonButton>
//           <IonButton onClick={handleOnClick}>
//             <IonIcon slot="icon-only" icon={informationCircleOutline} />
//           </IonButton>
// }

const ChatHeader: React.FC<Props> = ({
  id,
  username,
  pathname,
  conversant,
}) => {
  const history = useHistory();
  const intl = useIntl();
  const [present, dismiss] = useIonPopover(ChatMenuItems, {
    onHide: () => dismiss(),
    history,
    conversant,
    pathname,
    intl,
  });
  const handleOnBack = () => history.goBack();

  const handleOnProfileClick = () =>
    history.push({
      pathname: `/p/${id}`,
      //   state: { profile: { username: state?.username, id } },
      state: { profile: { username, id }, prev: `/u/${id}` },
    });

  // const handleOnClick = () => {
  //   history.push({
  //     pathname: `${pathname}/details`,
  //     state: { conversant },
  //   });
  // };

  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton onClick={handleOnBack} className="ion-no-padding">
            <IonIcon slot="icon-only" icon={arrowBackSharp} />
          </IonButton>
        </IonButtons>
        <div className={styles["title-container"]}>
          <IonAvatar className={`${styles["avatar"]} ion-padding`}>
            <Identicon hash={id} avatar={conversant.fields.avatar} size={50} />
          </IonAvatar>
          <IonTitle className={styles["title"]} onClick={handleOnProfileClick}>
            <AgentIdentifier nickname={username} id={id} />
          </IonTitle>
        </div>
        <IonButtons slot="end">
          <IonButton onClick={(e) => present({ event: e.nativeEvent })}>
            <IonIcon icon={ellipsisVerticalOutline}></IonIcon>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default ChatHeader;
