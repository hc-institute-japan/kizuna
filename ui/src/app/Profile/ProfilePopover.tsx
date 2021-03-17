import { IonIcon, IonItem, IonLabel, IonList, IonPopover } from "@ionic/react";
import {
  banOutline,
  personAddOutline,
  personRemoveOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  addContact,
  blockContact,
  removeContact,
  unblockContact,
} from "../../redux/contacts/actions";
import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import styles from "./style.module.css";

interface Props {
  isOpen: boolean;
  dismiss: () => any;
  profile: Profile;
}

const ProfilePopover: React.FC<Props> = ({ isOpen, dismiss, profile }) => {
  const [isContact, setIsContact] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const stringifiedId = profile.id;
  const dispatch = useAppDispatch();
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
    <IonPopover isOpen={isOpen} onDidDismiss={dismiss}>
      <IonList className={`${styles["popover-list"]}`}>
        {!isBlocked && isContact ? (
          <IonItem onClick={remove}>
            <IonIcon icon={personRemoveOutline} />
            <IonLabel className="ion-padding-start">
              Remove from contacts
            </IonLabel>
          </IonItem>
        ) : (
          <IonItem disabled={isBlocked} onClick={add}>
            <IonIcon icon={personAddOutline} />
            <IonLabel className="ion-padding-start">Add to contacts</IonLabel>
          </IonItem>
        )}
        {username !== profile.username ? (
          isBlocked ? (
            <IonItem onClick={unblock}>
              <IonIcon icon={banOutline}></IonIcon>
              <IonLabel className="ion-padding-start">Unblock profile</IonLabel>
            </IonItem>
          ) : (
            <IonItem onClick={block}>
              <IonIcon icon={banOutline}></IonIcon>
              <IonLabel className="ion-padding-start">Block profile</IonLabel>
            </IonItem>
          )
        ) : null}
      </IonList>
    </IonPopover>
  );
};

export default ProfilePopover;
