import {
  IonButton,
  IonButtons,
  IonFooter,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { arrowBack, ellipsisVerticalOutline } from "ionicons/icons";
import React, { SetStateAction, useEffect, useRef, useState } from "react";
import styles from "./style.module.css";

interface Props {
  state: [boolean, React.Dispatch<SetStateAction<boolean>>];
  src: string;
}

const ImageModal: React.FC<Props> = ({ state, src }) => {
  const [isOpen, setIsOpen] = state;
  const footer = useRef<HTMLIonToolbarElement>(null);
  const header = useRef<HTMLIonToolbarElement>(null);

  const [length, setLength] = useState("0px");

  useEffect(() => {
    if (isOpen)
      setLength(
        footer.current && header.current
          ? `calc(100vh - ${
              footer.current!.getBoundingClientRect().height
            }px - ${header.current!.getBoundingClientRect().height}px)`
          : "0px"
      );
  }, [isOpen]);

  return (
    <IonModal isOpen={isOpen} cssClass="fullscreen">
      <IonPage className={styles.modal}>
        <IonHeader>
          <IonToolbar ref={header}>
            <IonButtons>
              <IonButton onClick={() => setIsOpen(false)}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsOpen(false)}>
                <IonIcon icon={ellipsisVerticalOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <div
          className={styles.content}
          style={{
            height: length,
          }}
        >
          <img
            style={{
              [window.innerWidth > window.innerHeight
                ? "height"
                : "width"]: "100%",
            }}
            alt="Message content"
            src={src}
          />
        </div>

        <IonFooter>
          <IonToolbar ref={footer} />
        </IonFooter>
      </IonPage>
    </IonModal>
  );
};

export default ImageModal;
