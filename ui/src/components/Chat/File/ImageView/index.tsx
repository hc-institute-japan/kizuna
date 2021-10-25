import { IonImg } from "@ionic/react";
import React, { useRef, useState } from "react";
import { FilePayload } from "../../../../redux/commons/types";

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
  const [isOpen, setIsOpen] = useState(false);
  const handleOnImageOnClick = () => {
    if (!err) {
      setIsOpen(true);
    }
  };

  const container = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("auto");

  return (
    <>
      <ImageModal
        onDownload={onDownload}
        state={[isOpen, setIsOpen]}
        src={src}
        file={file}
      />
      <div
        ref={container}
        className={`${styles.image} ${className ? className : ""}`}
        style={{ maxHeight }}
      >
        <IonImg
          onIonImgDidLoad={() => {
            setMaxHeight(
              `${container.current!.getBoundingClientRect().width * 1.25}px`
            );
          }}
          onClick={handleOnImageOnClick}
          src={src}
        />
      </div>
    </>
  );
};

export default Image;
