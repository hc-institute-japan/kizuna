import {
  IonButton,
  IonButtons,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonPopover,
  IonToolbar,
} from "@ionic/react";
import { arrowBack, ellipsisVerticalOutline } from "ionicons/icons";
import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { FilePayload } from "../../../../../redux/commons/types";
import { RootState } from "../../../../../redux/types";
import styles from "./style.module.css";

interface Props {
  state: [boolean, React.Dispatch<SetStateAction<boolean>>];
  src: string;
  file: FilePayload;
  onDownload?(file: FilePayload): any;
}

const ImageModal: React.FC<Props> = ({ state, src, file, onDownload }) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = state;
  const footer = useRef<HTMLIonToolbarElement>(null);
  const header = useRef<HTMLIonToolbarElement>(null);
  const [length, setLength] = useState("0px");
  const [popover, setPopover] = useState<{
    isOpen: boolean;
    event: Event | undefined;
  }>({
    isOpen: false,
    event: undefined,
  });
  const fileBytes = useSelector(
    (state: RootState) => 
      // state.groups.groupFiles[`u${file.fileHash}`]
      {
        let fileSet = Object.assign({}, state.groups.groupFiles, state.p2pmessages.files);
        return fileSet[`u${file.fileHash}`];
      }
  );

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

  const download = () => {
    if (fileBytes) {
      const blob = new Blob([fileBytes]); // change resultByte to bytes

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.fileName;
      link.click();
      setPopover({
        isOpen: false,
        event: undefined,
      });
    }
  };

  return (
    <IonModal isOpen={isOpen} cssClass="fullscreen">
      <IonPage>
        <IonHeader>
          <IonToolbar className={styles.toolbar} ref={header}>
            <IonButtons>
              <IonButton onClick={() => setIsOpen(false)}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton
                onClick={(e: any) => {
                  e.persist();
                  setPopover({ isOpen: true, event: e });
                }}
              >
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
        {/* <ion-popover ><popover-example-page class="popover-viewport sc-ion-popover-ios">
          <ion-list class="ios list-ios hydrated">
            <ion-list-header class="ios hydrated">Ionic</ion-list-header>
            <ion-item button="" class="item ios in-list ion-activatable ion-focusable hydrated">Learn Ionic</ion-item>
            <ion-item button="" class="item ios in-list ion-activatable ion-focusable hydrated">Documentation</ion-item>
            <ion-item button="" class="item ios in-list ion-activatable ion-focusable hydrated">Showcase</ion-item>
            <ion-item button="" class="item ios in-list ion-activatable ion-focusable hydrated">GitHub Repo</ion-item>
            <ion-item lines="none" detail="false" button="" onclick="dismissPopover()" class="item ios item-lines-none in-list ion-activatable ion-focusable hydrated">Close</ion-item>
          </ion-list>
        </popover-example-page></div></div><div tabindex="0" class="sc-ion-popover-ios"></div></ion-popover> */}
        <IonPopover
          event={popover.event}
          isOpen={popover.isOpen}
          onDidDismiss={() => setPopover({ isOpen: false, event: undefined })}
        >
          <IonList>
            <IonItem lines="none" button onClick={onDownload ? () => onDownload(file) : download}>
              <IonLabel>{intl.formatMessage({id: "components.chat.media-modal-download"})}</IonLabel>
            </IonItem>
          </IonList>
        </IonPopover>
        <IonFooter>
          <IonToolbar className={styles.toolbar} ref={footer} />
        </IonFooter>
      </IonPage>
    </IonModal>
  );
};

export default ImageModal;
