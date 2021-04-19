import React, { useEffect, useRef, useState } from "react";
import Controls from "./Controls";
import styles from "./style.module.css";
import VideoPlayerModal from "./VideoPlayerModal";

interface Props {
  src: string;
  className?: string;
  type?: string;
  height?: number;
  width?: number;
}

const VideoPlayer: React.FC<Props> = ({
  src,
  className,
  type,
  height,
  width,
}) => {
  const style = [styles["video-player"]];
  if (className) style.push(className);
  const video = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOnPause = () => {
    setIsPlaying(false);
  };

  const handleOnPlay = () => {
    setIsPlaying(true);
  };

  return (
    <div
      className={style.join(" ")}
      {...{
        ...(height ? { height } : {}),
        ...(width ? { width } : {}),
      }}
    >
      <video
        onTimeUpdate={() =>
          setCurrentTime(video.current!.currentTime / video.current!.duration)
        }
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        ref={video}
        controls={false}
        loop={false}
        autoPlay={true}
      >
        <source src={src} {...(type ? { type } : {})} />
      </video>

      {video.current ? (
        <Controls
          duration={currentTime}
          video={video}
          isPlaying={isPlaying}
          modal={[isModalOpen, setIsModalOpen]}
        />
      ) : null}
      <VideoPlayerModal src={src} open={[isModalOpen, setIsModalOpen]} />
    </div>
  );
};

export default VideoPlayer;
