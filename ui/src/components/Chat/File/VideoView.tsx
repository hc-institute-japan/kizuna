import React from "react";
import { useSelector } from "react-redux";
import { FilePayload } from "../../../redux/commons/types";
import { RootState } from "../../../redux/types";
import { base64ToUint8Array } from "../../../utils/helpers";
import VideoPlayer from "../../VideoPlayer";

import styles from "./style.module.css";

interface Props {
  file: FilePayload;
}

const Video: React.FC<Props> = ({ file }) => {
  const fileBytes = useSelector((state: RootState) => {
    return state.groups.groupFiles[`u${file.fileHash}`];
  });

  const download = () => {
    const blob = new Blob([fileBytes]); // change resultByte to bytes
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.fileName;
    link.click();
  };
  return (
    <div className={styles.video}>
      <VideoPlayer
        download={download}
        src={URL.createObjectURL(new Blob([fileBytes], { type: "video/mp4" }))}
        className={styles.video}
      />
    </div>
  );
};

export default Video;
