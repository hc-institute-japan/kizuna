import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLabel,
  IonLoading,
  IonPage,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import ImageCropper from "../../components/ImageCropper";
import HomeInput from "../../components/Input/HomeInput";
import UpdateAvatar from "../../components/UpdateAvatar";
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

  const [binary, setBinary] = useState<Uint8Array | null>(null);
  const profilePicture = useRef<HTMLImageElement>(null);

  const intl = useIntl();

  const handleOnChange = (e: CustomEvent) => {
    setNickname(e.detail.value!);

    setError(
      (e.detail.value! as string).includes(" ")
        ? intl.formatMessage({
            id: "app.register.error-username-with-space",
          })
        : isUsernameFormatValid(e.detail.value!) && e.detail!.value!.length >= 3
        ? null
        : intl.formatMessage({
            id: "app.register.error-invalid-username",
          })
    );
  };

  useEffect(() => {
    if (error || nickname.length === 0) setIsDisabled(true);
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

  const handleOnFileChange = (binary: Uint8Array) => {
    setBinary(binary);
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
    onComplete: (cropperBinary: Uint8Array) => {
      if (cropperBinary) {
        const blob = new Blob([cropperBinary!], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);

        profilePicture.current!.src = url;
        setBinary(cropperBinary);
      }
    },
    intl,
  });

  const handleOnKeyDown = (event: React.KeyboardEvent) =>
    event.key === "Enter" && !event.shiftKey && !error
      ? handleOnSubmit()
      : null;

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
            <UpdateAvatar
              imageRef={profilePicture}
              onChange={handleOnFileChange}
            />
            <div>
              <IonLabel className={styles.label}>
                {intl.formatMessage({
                  id: "app.register.username-label",
                })}
              </IonLabel>

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
