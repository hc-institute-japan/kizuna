import React, { useEffect, useRef, useState } from "react";
import Controls from "./Controls";
import styles from "./style.module.css";
import VideoPlayerModal from "./VideoPlayerModal";

interface Props {
  src: string;
  className?: string;
  thumbnail?: string;
  download?(): any;
  onPlayPauseErrorHandler?(setErrorState: (bool: boolean) => any): any;
}

const VideoPlayer: React.FC<Props> = ({
  src,
  className,
  thumbnail,
  download,
  onPlayPauseErrorHandler,
}) => {
  const style = [styles["video-player"]];
  if (className) style.push(className);
  const video = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div
      ref={container}
      className={style.join(" ")}
      onDoubleClick={() => {
        setIsPlaying(false);
        setIsModalOpen(true);
      }}
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
      {/* {video.current ? ( */}
      <Controls
        isPlaying={isPlaying}
        hasError={hasError}
        onPlayPauseErrorHandler={errorHandler}
        duration={currentTime}
        video={video}
        modal={[isModalOpen, setIsModalOpen]}
      />
      {/* ) : null} */}
      <VideoPlayerModal
        download={download}
        onPlayPauseErrorHandler={onPlayPauseErrorHandler}
        src={src}
        open={[isModalOpen, setIsModalOpen]}
      />
    </div>
  );
};

export default VideoPlayer;
