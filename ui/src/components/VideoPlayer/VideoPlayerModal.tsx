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
import {
  arrowBack,
  ellipsisVerticalOutline,
  pause,
  play,
} from "ionicons/icons";
import React, {
  Fragment,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./style.module.css";

interface Props {
  src: string;
  open: [boolean, React.Dispatch<SetStateAction<boolean>>];
}

const VideoPlayerModal: React.FC<Props> = ({ open, src }) => {
  const [isOpen, setIsOpen] = open;
  const [popover, setPopover] = useState({ isOpen: false, event: undefined });
  const footer = useRef<HTMLIonToolbarElement>(null);
  const header = useRef<HTMLIonToolbarElement>(null);
  const [length, setLength] = useState("0px");
  const [currentTime, setCurrentTime] = useState(0);
  const [isControlVisible, setIsControlVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  let timeout = useRef<NodeJS.Timeout>();

  const video = useRef<HTMLVideoElement>(null);

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

  const handleOnPlay = () => {
    setIsPlaying(true);
  };

  const handleOnPause = () => {
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    if (!isPlaying) video.current?.play();
    else video.current?.pause();
  };

  const onTimeUpdate = () =>
    setCurrentTime(video.current!.currentTime / video.current!.duration);

  const handleOnClick = () => {
    setIsControlVisible(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(function () {
      setIsControlVisible(false);
    }, 3000);
  };

  return (
    <IonModal isOpen={isOpen} cssClass="fullscreen">
      <IonPage>
        <IonHeader>
          <IonToolbar ref={header} className={styles.toolbar}>
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
          onClick={handleOnClick}
        >
          <video
            ref={video}
            style={{
              [window.innerWidth > window.innerHeight
                ? "height"
                : "width"]: "100%",
            }}
            autoPlay={false}
            controls={false}
            onTimeUpdate={onTimeUpdate}
            onPlay={handleOnPlay}
            onPause={handleOnPause}
            loop={false}
            src={src}
          />
          {video.current ? (
            <div
              style={{ opacity: isControlVisible ? 1 : 0 }}
              className={styles["modal-control"]}
            >
              <div className={styles["play-pause"]} onClick={onPlayPause}>
                <IonIcon icon={isPlaying ? pause : play} />
              </div>
            </div>
          ) : null}
        </div>

        <IonFooter>
          <IonToolbar ref={footer} className={styles.toolbar}>
            <div className={styles["slider-volume"]}>
              <input
                step={currentTime * 100}
                value={currentTime * 100}
                min={0}
                max={100}
                type="range"
              />
            </div>
          </IonToolbar>
        </IonFooter>

        <IonPopover
          event={popover.event}
          isOpen={popover.isOpen}
          onDidDismiss={() => setPopover({ isOpen: false, event: undefined })}
        >
          <IonList>
            <IonItem onClick={() => {}}>
              <IonLabel>Download</IonLabel>
            </IonItem>
          </IonList>
        </IonPopover>
      </IonPage>
    </IonModal>
  );
};

export default VideoPlayerModal;
