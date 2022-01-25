import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonLoading,
  IonPage,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import { close, imageOutline, personCircleOutline } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import ImageCropper from "../../components/ImageCropper";
import HomeInput from "../../components/Input/HomeInput";
import { createProfile } from "../../redux/profile/actions";
import { useAppDispatch } from "../../utils/helpers";
import { isUsernameFormatValid } from "../../utils/regex";
import styles from "./style.module.css";

const Register: React.FC = () => {
  const [nickname, setNickname] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const file = useRef<HTMLInputElement>(null);
  const [binary, setBinary] = useState<Uint8Array | null>(null);
  const profilePicture = useRef<HTMLImageElement>(null);

  const intl = useIntl();

  const handleOnChange = (e: CustomEvent) => {
    setNickname(e.detail.value!);

    setError(
      isUsernameFormatValid(e.detail.value!) && e.detail!.value!.length >= 3
        ? null
        : intl.formatMessage({
            id: "app.register.error-invalid-username",
          })
    );
  };

  useEffect(() => {
    if (error || nickname.length === 0 || binary === null) setIsDisabled(true);
    else setIsDisabled(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, nickname, binary]);

  const handleOnSubmit = () => {
    setLoading(true);
    dispatch(
      createProfile(
        nickname,
        !profilePicture.current!.src.includes("svg") ? binary : null
      )
    ).then((res: any) => {
      if (!res) setLoading(false);
    });
  };

  useEffect(() => {
    if (binary) present({ cssClass: `cropper ${styles.modal}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binary]);

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
          };
        });
      }
    );
  };

  const onDismiss = () => {
    // setSrc(null);
    dismiss();
  };

  const decodeSrc = () => {
    const decoder = new TextDecoder();

    return binary ? decoder.decode(binary) : "";
  };

  const [present, dismiss] = useIonModal(ImageCropper, {
    src: decodeSrc(),
    prevPath: "/register",
    dismiss: onDismiss,
    onComplete: (binary: Uint8Array) => {
      if (binary) {
        const blob = new Blob([binary], { type: "image/jpeg" });
        profilePicture.current!.src = URL.createObjectURL(blob);
        setBinary(binary);
      }
    },
  });

  const handleOnKeyDown = (event: React.KeyboardEvent) =>
    event.key === "Enter" && !event.shiftKey && !error
      ? handleOnSubmit()
      : null;

  // const createImageFromInitials = (size, name) => {
  //   if (name == null) return;

  //   const canvas = document.createElement("canvas");
  //   const context = canvas.getContext("2d");
  //   canvas.width = canvas.height = size;

  //   context.fillStyle = "#ffffff";
  //   context.fillRect(0, 0, size, size);

  //   context.fillStyle = `${color}50`;
  //   context.fillRect(0, 0, size, size);

  //   context.fillStyle = color;
  //   context.textBaseline = "middle";
  //   context.textAlign = "center";
  //   context.font = `${size / 2}px Roboto`;
  //   context.fillText(name, size / 2, size / 2);

  //   return canvas.toDataURL();
  // };

  const onAvatarChange = () => {
    file.current!.value = "";
    file.current?.click();
  };

  // const onRemoveAvatar = () => {
  //   file!.current!.value = "";
  //   setBinary(null);
  //   profilePicture.current!.src = personCircleOutline;
  // };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className={styles.toolbar}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.register}>
          <div className={styles.form}>
            <div className={styles["profile-picture"]}>
              <IonLabel className={styles.label}>
                {intl.formatMessage({
                  id: "app.register.avatar-label",
                })}
              </IonLabel>
              <div className={styles["profile-picture-content"]}>
                <div className={styles["avatar-container"]}>
                  <img
                    alt="avatar"
                    ref={profilePicture}
                    src={personCircleOutline}
                    className={`${styles.avatar} ${
                      binary ? "" : styles.default
                    }`}
                  />
                </div>
                <div className="ion-padding-start">
                  <IonButtons>
                    <IonButton
                      onClick={onAvatarChange}
                      fill="solid"
                      type="button"
                      color="primary"
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
            <div>
              <IonLabel className={styles.label}>
                {intl.formatMessage({
                  id: "app.register.username-label",
                })}
              </IonLabel>
              <input
                ref={file}
                accept="image/png, image/jpeg"
                type="file"
                hidden
                onChange={handleOnFileChange}
              />
              <HomeInput
                value={nickname}
                onIonChange={handleOnChange}
                onKeyPress={(event: React.KeyboardEvent) =>
                  handleOnKeyDown(event)
                }
                placeholder={intl.formatMessage({
                  id: "app.register.username-placeholder",
                })}
                error={error}
                debounce={600}
              />
            </div>
          </div>
          <IonButton onClick={handleOnSubmit} disabled={isDisabled}>
            {intl.formatMessage({
              id: "app.register.register",
            })}
          </IonButton>
        </div>
        <IonLoading isOpen={loading} />
      </IonContent>
    </IonPage>
  );
};

export default Register;
