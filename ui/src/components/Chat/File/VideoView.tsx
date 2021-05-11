import React from "react";
import { useSelector } from "react-redux";
import { FilePayload } from "../../../redux/commons/types";
import { RootState } from "../../../redux/types";
import VideoPlayer from "../../VideoPlayer";
import styles from "./style.module.css";

interface Props {
  file: FilePayload;
  onDownload?(file: FilePayload): any;
}

const Video: React.FC<Props> = ({ file, onDownload }) => {
  const fileBytes = useSelector((state: RootState) => {
    return state.groups.groupFiles[`u${file.fileHash}`];
  });

  const download = () => {
    if (fileBytes) {
      const blob = new Blob([fileBytes]); // change resultByte to bytes
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = file.fileName;
      link.click();
    }
  };
  return (
    <div className={styles.video}>
      <VideoPlayer
        download={onDownload ? () => onDownload(file) : download}
        src={URL.createObjectURL(new Blob([fileBytes], { type: "video/mp4" }))}
        className={styles.video}
      />
    </div>
  );
};

export default Video;
