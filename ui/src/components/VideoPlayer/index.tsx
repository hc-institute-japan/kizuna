import { useIonModal } from "@ionic/react";
import React, { useRef, useState } from "react";
import { useIntl } from "react-intl";
import Controls from "./Controls";
import styles from "./style.module.css";
import VideoPlayerModal from "./VideoPlayerModal";

interface Props {
  src: string;
  className?: string;
  thumbnail?: string;
  download?(): any;
  onPlayPauseErrorHandler?(setErrorState: (bool: boolean) => any): any;
  err?: boolean;
}

const VideoPlayer: React.FC<Props> = ({
  src,
  className,
  thumbnail,
  download,
  onPlayPauseErrorHandler,
  err,
}) => {
  const style = [styles["video-player"]];
  if (className) style.push(className);
  const video = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [hasError, setHasError] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const handleOnPause = () => {
    setIsPlaying(false);
  };

  const handleOnPlay = () => {
    setIsPlaying(true);
  };

  const handleError = (e: any) => setHasError(true);

  const errorHandler = () => {
    if (onPlayPauseErrorHandler) onPlayPauseErrorHandler(setHasError);
  };

  const intl = useIntl();

  const onDismiss = () => dismiss();

  const [present, dismiss] = useIonModal(VideoPlayerModal, {
    download,
    onPlayPauseErrorHandler,
    src,
    intl,
    onDismiss,
  });

  const onDoubleClick = () => {
    setIsPlaying(false);
    present({ cssClass: "video-view" });
  };

  return (
    <div
      ref={container}
      className={style.join(" ")}
      onDoubleClick={onDoubleClick}
    >
      <video
        className={styles.video}
        onTimeUpdate={() =>
          setCurrentTime(
            !isNaN(video.current!.currentTime / video.current!.duration)
              ? video.current!.currentTime / video.current!.duration
              : 0
          )
        }
        poster={thumbnail}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        ref={video}
        controls={false}
        loop={false}
        autoPlay={false}
        src={src}
        onError={handleError}
      />
      {!err ? (
        <Controls
          isPlaying={isPlaying}
          hasError={hasError}
          onPlayPauseErrorHandler={errorHandler}
          duration={currentTime}
          video={video}
          present={present}
        />
      ) : null}
    </div>
  );
};

export default VideoPlayer;
