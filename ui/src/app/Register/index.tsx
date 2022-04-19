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
  IonImg,
} from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import ImageCropper from "../../components/ImageCropper";
import HomeInput from "../../components/Input/HomeInput";
import UpdateAvatar from "../../components/UpdateAvatar";
import { createProfile } from "../../redux/profile/actions";
import { useAppDispatch } from "../../utils/services/ReduxService";
import { isUsernameFormatValid } from "../../utils/services/RegexService";
import styles from "./style.module.css";
import { KizunaAvatar, KizunaButton, KizunaTextbox } from "kizuna-react-kit";
import kizunaLogo from "../../assets/kizuna_logo2.png";

import * as name from "@holochain-open-dev/profiles";
import {
  ProfilesStore,
  profilesStoreContext,
} from "@holochain-open-dev/profiles";
// import { ContextProvider } from "@holochain-open-dev/context";
import { HolochainClient } from "@holochain-open-dev/cell-client";
import { appId, appUrl } from "../../utils/services/HolochainService";
import { ContextProvider, CreateProfile, SearchAgent } from "./elements";
import { createMockZome } from "./mock-zome";

const Register: React.FC = () => {
  const [nickname, setNickname] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [store, setStore] = useState({});
  const dispatch = useAppDispatch();

  const [binary, setBinary] = useState<Uint8Array | null>(null);
  const profilePicture = useRef<HTMLImageElement>(null);

  const intl = useIntl();
  // console.log("name ", name);

  const setupProfilesStore = async () => {
    const client = await HolochainClient.connect(
      // TODO: change this to the port where holochain is listening,
      // or `ws://localhost:${process.env.HC_PORT}` if you used the scaffolding tooling to bootstrap the application
      `ws://localhost:8888`,
      // TODO: change "my-app-id" for the installed_app_id of your application
      "kizuna"
    );

    // TODO: change "my-cell-role" for the roleId that you can find in your "happ.yaml"
    // const cellClient = client?.forCell(client.cellDataByRoleId("kizuna-lobby"));

    // return new ProfilesStore(cellClient, {
    //   avatarMode: "avatar",
    // });
  };

  useEffect(() => {
    setupProfilesStore().then((store) => setStore(store));
    // setupProfilesStore();
  }, []);

  // async function connect() {
  //   const cellClient = await createMockZome();
  //   return new ProfilesStore(cellClient);
  // }
  // useEffect(() => {
  //   connect().then((store) => {
  //     setStore(store);
  //   });
  // });

  const handleOnChange = (e: CustomEvent) => {
    // setNickname(e.detail.value!);
    setNickname(e.detail);

    // setError(
    //   (e.detail.value! as string).includes(" ")
    //     ? intl.formatMessage({
    //         id: "app.register.error-username-with-space",
    //       })
    //     : isUsernameFormatValid(e.detail.value!) && e.detail!.value!.length >= 3
    //     ? null
    //     : intl.formatMessage({
    //         id: "app.register.error-invalid-username",
    //       })
    // );
  };

  useEffect(() => {
    if (error || nickname.length === 0) setIsDisabled(true);
    else setIsDisabled(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, nickname, binary]);

  const handleOnSubmit = () => {
    setLoading(true);
    console.log("clicked");
    // dispatch(
    //   createProfile(
    //     nickname,
    //     !profilePicture.current!.src.includes("svg") ? binary : null
    //   )
    // ).then((res: any) => {
    //   if (!res) setLoading(false);
    // });
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
    <ContextProvider context={profilesStoreContext} value={store}>
      <IonPage>
        {/* <IonHeader>
        <IonToolbar className={styles.toolbar}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
        </IonToolbar>
      </IonHeader> */}

        <IonContent className={styles.registerContentWrapper}>
          <div className={styles.registerPageContent}>
            {/* UI MODULE FROM HOLOCHAIN */}
            {/* <CreateProfile className={styles.profiles}>
              <h2>test</h2>
            </CreateProfile> */}

            {/* Custom UI */}
            <div className={styles.contentContainer}>
              <div className={styles.brandContainer}>
                <div>
                  <IonImg src={kizunaLogo} className={styles.logoWhite} />
                  <p className={styles.kizunaLine}>
                    Protect your conversation with confidence
                  </p>
                </div>
              </div>
              <div className={styles.formContainer}>
                <div className={styles.formContent}>
                  <IonImg
                    src="assets/icon/kizuna_logo.png"
                    className={styles.logo}
                  />
                  <div className={styles.avatarContainer}>
                    <KizunaAvatar
                      name="K M"
                      size="lg"
                      classes={{ avatarWrapper: styles.avatarWrapper }}
                    />
                    <KizunaButton
                      text="Change Avatar"
                      type="secondary"
                      classes={{ btnWrapper: styles.changeAvatarBtn }}
                      handleClick={handleOnSubmit}
                    />
                  </div>

                  {/*<KizunaAvatar
                size="xs"
                image="https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
              /> */}

                  <KizunaTextbox
                    label={intl.formatMessage({
                      id: "app.register.username-label",
                    })}
                    placeholder="test"
                    // placeholder={intl.formatMessage({
                    //   id: "app.register.username-placeholder",
                    // })}
                    value={nickname}
                    onHandleChange={handleOnChange}
                    variant="standard"
                    classes={{ input: styles.transparentBg }}
                    // error={error}
                    // debounce={600}
                  />

                  <KizunaButton
                    text="Register"
                    type="primary"
                    classes={{ btnWrapper: styles.registerBtn }}
                    handleClick={handleOnSubmit}
                  />
                </div>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    </ContextProvider>
  );
};

export default Register;
