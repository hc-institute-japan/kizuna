import { IonImg, useIonModal } from "@ionic/react";
import React, { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { FilePayload } from "../../../../redux/commons/types";
import { RootState } from "../../../../redux/types";

import ImageModal from "./ImageModal";
import styles from "./style.module.css";

interface Props {
  src: string;
  file: FilePayload;
  className?: string;
  onDownload?(file: FilePayload): any;
  err?: boolean;
}

const Image: React.FC<Props> = ({ src, file, className, onDownload, err }) => {
  const intl = useIntl();
  const fileBytes = useSelector((state: RootState) =>
    // state.groups.groupFiles[`u${file.fileHash}`]
    {
      const fileSet = Object.assign(
        {},
        state.groups.groupFiles,
        state.p2pmessages.files
      );
      return fileSet[file.fileHash!];
    }
  );

  const handleOnImageOnClick = () => {
    if (!err) {
      present({ cssClass: "image-view" });
    }
  };
  const onDismiss = () => dismiss();

  const [present, dismiss] = useIonModal(ImageModal, {
    onDownload,
    onDismiss,
    src,
    file,
    fileBytes,
    intl,
  });

  const container = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("auto");

  return (
    <>
      <div
        ref={container}
        className={`${styles.image} ${className ? className : ""}`}
        style={{ maxHeight }}
      >
        <IonImg
          onIonImgDidLoad={() =>
            setMaxHeight(
              `${container.current!.getBoundingClientRect().width * 1.25}px`
            )
          }
          onClick={handleOnImageOnClick}
          src={src}
        />
      </div>
    </>
  );
};

export default Image;
