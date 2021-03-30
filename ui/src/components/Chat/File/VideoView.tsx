import React from "react";
import { FilePayload } from "../../../redux/commons/types";
import { base64ToUint8Array } from "../../../utils/helpers";

import styles from "./style.module.css";

interface Props {
  file: FilePayload;
}

const Video: React.FC<Props> = ({ file }) => {
  return (
    <div className={styles.video}>
      <video
        src={URL.createObjectURL(
          new Blob([base64ToUint8Array(file.fileHash)], { type: "video/mp4" })
        )}
        autoPlay={false}
        controls={true}
      />
    </div>
  );
};

export default Video;
