import { isPlatform } from "@ionic/core";
import { IonIcon, IonSpinner } from "@ionic/react";
import { expandOutline, pause, play, download } from "ionicons/icons";
import React, {
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./style.module.css";

interface Props {
  video: RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  duration: number;
  present(args: any): any;
  hasError: boolean;
  onPlayPauseErrorHandler?(): any;
}

const Controls: React.FC<Props> = ({
  video,
  present,
  isPlaying,
  duration,
  hasError,
  onPlayPauseErrorHandler,
}) => {
  const [visible, setVisible] = useState(isPlatform("mobile"));
  const timeout = useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(
    function () {
      if (!hasError) setIsLoading(false);
    },
    [hasError]
  );

  const resetTimeout = () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(function () {
      setVisible(false);
    }, 1000);
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
    present({ cssClass: `video-view` });
  };

  const clickTimeout = useRef<NodeJS.Timeout | null>();

  const onTimeoutClick = (callback: () => any) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    clickTimeout.current = setTimeout(() => {
      callback();
    }, 200);
  };

  const onPlayPause = () => {
    if (!hasError) {
      if (!isPlaying) video.current?.play();
      else video.current?.pause();
    } else {
      setIsLoading(true);
      if (onPlayPauseErrorHandler) onPlayPauseErrorHandler();
    }
  };

  return (
    <div
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={resetTimeout}
      onClick={handleOnClick}
      className={styles.controls}
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className={styles["play-pause"]}
        onClick={() => onTimeoutClick(onPlayPause)}
        onTouchEnd={() => onTimeoutClick(onPlayPause)}
      >
        {isLoading ? (
          <IonSpinner />
        ) : (
          <IonIcon
            icon={
              hasError // bytes are not loaded yet
                ? isPlaying
                  ? pause // will not happen
                  : download
                : isPlaying // bytes are loaded
                ? pause
                : play
            }
          />
        )}
      </div>
      <div className={styles["range-slider-expand"]}>
        <div className={styles["range-slider"]}>
          <input
            type="range"
            onChange={() => {}}
            value={duration * 100}
            min={0}
            max={100}
          />
        </div>
        <div className={styles.expand}>
          <IonIcon
            onClick={handleOnDoubleClick}
            onTouchEnd={handleOnDoubleClick}
            icon={expandOutline}
          />
        </div>
      </div>
    </div>
  );
};

export default Controls;
