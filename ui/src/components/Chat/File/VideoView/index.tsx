import React from "react";
import { useSelector } from "react-redux";
import { FilePayload } from "../../../../redux/commons/types";
import { RootState } from "../../../../redux/types";
import { useAppDispatch } from "../../../../utils/helpers";
import VideoPlayer from "../../../VideoPlayer";
import styles from "./style.module.css";

interface Props {
  file: FilePayload;
  onDownload?(file: FilePayload): any;
  onPlayPauseErrorHandler?(setErrorState: (bool: boolean) => any): any;
}

const Video: React.FC<Props> = ({
  file,
  onDownload,
  onPlayPauseErrorHandler,
}) => {
  const fileBytes = useSelector((state: RootState) => {
    let fileSet = Object.assign(
      {},
      state.groups.groupFiles,
      state.p2pmessages.files
    );
    return fileSet[file.fileHash];
    // return state.groups.groupFiles[`u${file.fileHash}`];
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
        thumbnail={URL.createObjectURL(
          new Blob([file.thumbnail as Uint8Array], { type: "image/jpeg" })
        )}
        onPlayPauseErrorHandler={onPlayPauseErrorHandler}
      />
    </div>
  );
};

export default Video;
