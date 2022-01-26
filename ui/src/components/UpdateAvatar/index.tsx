import { IonButton, IonButtons, IonLabel } from "@ionic/react";
import { personCircleOutline } from "ionicons/icons";
import React, { useRef, useState } from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

interface Props {
  onChange(binary: Uint8Array): any;
  imageRef: React.RefObject<HTMLImageElement>;
}

const UpdateAvatar: React.FC<Props> = ({ onChange, imageRef }) => {
  const intl = useIntl();

  const [binary, setBinary] = useState<Uint8Array | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const onAvatarChange = () => {
    file.current!.value = "";
    file.current?.click();
  };

  const handleOnFileChange = () => {
    Array.from(file.current ? file.current.files! : new FileList()).forEach(
      (file) => {
        file.arrayBuffer().then((_arrBuffer) => {
          const reader = new FileReader();
          const encoder = new TextEncoder();

          reader.readAsDataURL(file);
          reader.onload = (readerEvent) => {
            const encoded = encoder.encode(
              readerEvent.target?.result as string
            );

            setBinary(encoded);
            onChange(encoded);
          };
        });
      }
    );
  };

  return (
    <div className={styles["profile-picture"]}>
      <input
        ref={file}
        accept="image/png, image/jpeg"
        type="file"
        hidden
        onChange={handleOnFileChange}
      />
      <IonLabel className={styles.label}>
        {intl.formatMessage({
          id: "app.register.avatar-label",
        })}
      </IonLabel>
      <div className={styles["profile-picture-content"]}>
        <div className={styles["avatar-container"]}>
          <img
            alt="avatar"
            ref={imageRef}
            src={personCircleOutline}
            className={`${styles.avatar} ${binary ? "" : styles.default}`}
          />
        </div>
        <div className="ion-padding-start">
          <IonButtons>
            <IonButton
              onClick={onAvatarChange}
              fill="solid"
              type="button"
              color="primary"
              className={styles["avatar-button"]}
            >
              <IonLabel className={styles["button-label"]}>
                {intl.formatMessage({
                  id: "app.register.button-avatar-label",
                })}
              </IonLabel>
            </IonButton>
          </IonButtons>
        </div>
      </div>
    </div>
  );
};

export default UpdateAvatar;
