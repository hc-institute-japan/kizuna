import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from "@ionic/react";
import {
  banOutline,
  personAddOutline,
  personRemoveOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import {
  addContact,
  blockContact,
  removeContact,
  unblockContact,
} from "../../../redux/contacts/actions";
import { Profile } from "../../../redux/profile/types";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/services/ReduxService";
import styles from "./style.module.css";

interface Props {
  popover: {
    isVisible: boolean;
    event: Event | undefined;
  };
  dismiss: () => any;
  profile: Profile;
}

const ProfilePopover: React.FC<Props> = ({ popover, dismiss, profile }) => {
  const [isContact, setIsContact] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const stringifiedId = profile.id;
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const username = useSelector((state: RootState) => state.profile.username);

  const { contacts, blocked } = useSelector(
    (state: RootState) => state.contacts
  );

  useEffect(() => {
    setIsContact(stringifiedId in contacts);
    setIsBlocked(stringifiedId in blocked);
  }, [contacts, blocked, stringifiedId]);

  const add = () => {
    dispatch(addContact(profile)).then((res: boolean) => {
      setIsContact(res);
    });
  };

  const remove = () => {
    dispatch(removeContact(profile)).then((res: boolean) => {
      setIsContact(!res);
    });
  };

  const block = () => {
    dispatch(blockContact(profile)).then((res: boolean) => {
      setIsBlocked(res);
    });
  };

  const unblock = () => {
    dispatch(unblockContact(profile)).then((res: boolean) => {
      setIsBlocked(!res);
    });
  };

  return (
    <IonPopover
      {...(popover.event ? { event: popover.event as Event } : {})}
      isOpen={popover.isVisible}
      onDidDismiss={dismiss}
    >
      <IonList className={`${styles["popover-list"]}`}>
        {!isBlocked && isContact ? (
          <IonItem onClick={remove}>
            <IonIcon icon={personRemoveOutline} />
            <IonLabel className="ion-padding-start">
              {intl.formatMessage({ id: "app.contacts.remove" })}
            </IonLabel>
          </IonItem>
        ) : (
          <IonItem disabled={isBlocked} onClick={add}>
            <IonIcon icon={personAddOutline} />
            <IonLabel className="ion-padding-start">
              {intl.formatMessage({ id: "app.contacts.add" })}
            </IonLabel>
          </IonItem>
        )}
        {username !== profile.username ? (
          isBlocked ? (
            <IonItem onClick={unblock}>
              <IonIcon icon={banOutline}></IonIcon>
              <IonLabel className="ion-padding-start">
                {intl.formatMessage({ id: "app.contacts.unblock" })}
              </IonLabel>
            </IonItem>
          ) : (
            <IonItem onClick={block}>
              <IonIcon icon={banOutline}></IonIcon>
              <IonLabel className="ion-padding-start">
                {intl.formatMessage({ id: "app.contacts.block" })}
              </IonLabel>
            </IonItem>
          )
        ) : null}
      </IonList>
    </IonPopover>
  );
};

export default ProfilePopover;
