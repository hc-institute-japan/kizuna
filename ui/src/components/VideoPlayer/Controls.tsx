import { IonIcon } from "@ionic/react";
import { expandOutline, pause, play } from "ionicons/icons";
import React, { RefObject, SetStateAction, useRef, useState } from "react";
import styles from "./style.module.css";

interface Props {
  video: RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  duration: number;
  modal: [boolean, React.Dispatch<SetStateAction<boolean>>];
}

const Controls: React.FC<Props> = ({ video, isPlaying, duration, modal }) => {
  const [visible, setVisible] = useState(false);
  const [isOpen, setIsOpen] = modal;

  let timeout = useRef<NodeJS.Timeout>();

  const resetTimeout = () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(function () {
      setVisible(false);
    }, 3000);
  };

  const handleOnMouseEnter = () => {
    setVisible(true);
    if (timeout.current) clearTimeout(timeout.current);
  };

  const handleOnClick = () => {
    setVisible(true);
    resetTimeout();
  };

  const handleOnDoubleClick = () => {
    setIsOpen(isOpen ? false : true);
  };

  const onPlayPause = () => {
    if (!isPlaying) video.current?.play();
    else video.current?.pause();
  };

  return (
    <div
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={resetTimeout}
      onClick={handleOnClick}
      onDoubleClick={handleOnDoubleClick}
      className={styles.controls}
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className={styles["play-pause"]} onClick={onPlayPause}>
        <IonIcon icon={!isPlaying ? play : pause} />
      </div>
      <div className={styles["range-slider-expand"]}>
        <div className={styles["range-slider"]}>
          <input type="range" value={duration * 100} min={0} max={100} />
        </div>
        <div className={styles.expand}>
          <IonIcon onClick={handleOnDoubleClick} icon={expandOutline} />
        </div>
      </div>
    </div>
  );
};

export default Controls;
