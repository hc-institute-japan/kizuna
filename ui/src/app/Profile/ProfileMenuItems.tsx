import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { ellipsisVertical, shieldHalf } from "ionicons/icons";
import React, { MouseEvent, useState } from "react";
import { Profile } from "../../redux/profile/types";
import ProfilePopover from "./ProfilePopover";

interface Props {
  profile: Profile;
}

const ProfileMenuItems: React.FC<Props> = ({ profile }) => {
  const [popover, setPopover] = useState<{
    isVisible: boolean;
    event: Event | undefined;
  }>({ isVisible: false, event: undefined });
  const handleOnClick = (event: any) => {
    event.persist();
    setPopover({ isVisible: true, event });
  };

  const dismiss = () => setPopover({ isVisible: false, event: undefined });
  return (
    <>
      <IonButtons slot="end">
        {/* <IonButton>
          <IonIcon icon={shieldHalf}></IonIcon>
        </IonButton> */}
        <IonButton onClick={handleOnClick}>
          <IonIcon icon={ellipsisVertical}></IonIcon>
        </IonButton>
      </IonButtons>
      <ProfilePopover
        profile={profile}
        popover={popover}
        dismiss={dismiss}
      ></ProfilePopover>
    </>
  );
};

export default ProfileMenuItems;
