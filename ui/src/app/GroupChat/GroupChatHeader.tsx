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
  peopleCircleOutline,
  pinOutline,
  search,
} from "ionicons/icons";
import React from "react";
import { IntlShape, useIntl } from "react-intl";
import { useHistory } from "react-router";
import { GroupConversation } from "../../redux/group/types";
import styles from "./style.module.css";

interface Props {
  groupData: GroupConversation;
}

interface MenuListProps {
  onHide(): void;
  groupData: GroupConversation;
  history: any;
  intl: IntlShape;
}

const GroupChatMenuList: React.FC<MenuListProps> = ({
  groupData,
  history,
  onHide,
  intl,
}) => {
  return (
    <IonList>
      <IonItem
        button
        href={`/g/${groupData.originalGroupId}/details`}
        onClick={() => {
          onHide();
          // history.push(`/g/${groupData.originalGroupId}/details`);
        }}
      >
        <IonIcon slot="start" icon={informationCircleOutline}></IonIcon>
        <IonLabel>
          {intl.formatMessage({ id: "app.group-chat.header-details" })}
        </IonLabel>
      </IonItem>

      <IonItem
        href={`/g/${groupData.originalGroupId}/search`}
        onClick={() => {
          onHide();
        }}
        button
      >
        <IonIcon slot="start" icon={search}></IonIcon>
        <IonLabel>
          {intl.formatMessage({ id: "app.group-chat.header-search" })}
        </IonLabel>
      </IonItem>

      <IonItem
        href={`/g/${groupData.originalGroupId}/pinned`}
        onClick={() => {
          onHide();
        }}
        button
      >
        <IonIcon slot="start" icon={pinOutline}></IonIcon>
        <IonLabel>
          {intl.formatMessage({ id: "app.group-chat.header-pinned-message" })}
        </IonLabel>
      </IonItem>
    </IonList>
  );
};

const GroupChatHeader: React.FC<Props> = ({ groupData }) => {
  const history = useHistory();
  const intl = useIntl();

  const [present, dismiss] = useIonPopover(GroupChatMenuList, {
    onHide: () => dismiss(),
    groupData,
    history,
    intl,
  });
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton
            href="/home"
            // onClick={() => history.push({ pathname: `/home` })}
            className="ion-no-padding"
          >
            <IonIcon slot="icon-only" icon={arrowBackSharp} />
          </IonButton>
        </IonButtons>
        <div className={styles["title-container"]}>
          <IonAvatar className="ion-padding">
            {/* TODO: proper picture for default avatar if none is set */}
            {/* TODO: Display an actual avatar set by the group creator */}
            <img
              className={styles["avatar"]}
              src={peopleCircleOutline}
              alt={groupData!.name}
            />
          </IonAvatar>

          <IonTitle className={styles["title"]}>{groupData!.name}</IonTitle>
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

export default GroupChatHeader;
