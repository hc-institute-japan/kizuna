import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { ellipsisVertical, shieldHalf } from "ionicons/icons";
import React, { useState } from "react";
import { Profile } from "../../redux/profile/types";
import ProfilePopover from "./ProfilePopover";

interface Props {
  profile: Profile;
}

const ProfileMenuItems: React.FC<Props> = ({ profile }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const handleOnClick = () => {
    setIsPopoverOpen(true);
  };

  const dismiss = () => setIsPopoverOpen(false);
  return (
    <>
      <IonButtons slot="end">
        <IonButton>
          <IonIcon icon={shieldHalf}></IonIcon>
        </IonButton>
        <IonButton onClick={handleOnClick}>
          <IonIcon icon={ellipsisVertical}></IonIcon>
        </IonButton>
      </IonButtons>
      <ProfilePopover
        profile={profile}
        isOpen={isPopoverOpen}
        dismiss={dismiss}
      ></ProfilePopover>
    </>
  );
};

export default ProfileMenuItems;
