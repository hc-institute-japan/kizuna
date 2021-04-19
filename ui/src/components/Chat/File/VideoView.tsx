import React from "react";
import { FilePayload } from "../../../redux/commons/types";
import { base64ToUint8Array } from "../../../utils/helpers";
import VideoPlayer from "../../VideoPlayer";

import styles from "./style.module.css";

interface Props {
  file: FilePayload;
}

const Video: React.FC<Props> = ({ file }) => {
  return (
    <div className={styles.video}>
      <VideoPlayer
        src={URL.createObjectURL(
          new Blob([base64ToUint8Array(file.fileHash)], { type: "video/mp4" })
        )}
        className={styles.video}
      />
    </div>
  );
};

export default Video;
