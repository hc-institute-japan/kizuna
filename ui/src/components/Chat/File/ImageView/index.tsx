import { IonImg } from "@ionic/react";
import React, { useState } from "react";
import { FilePayload } from "../../../../redux/commons/types";

import ImageModal from "./ImageModal";

interface Props {
  src: string;
  file: FilePayload;
  className?: string;
  onDownload?(file: FilePayload): any;
}

const Image: React.FC<Props> = ({ src, file, className, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOnImageOnClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <ImageModal
        onDownload={onDownload}
        state={[isOpen, setIsOpen]}
        src={src}
        file={file}
      />
      <IonImg
        {...(className ? { className } : {})}
        onClick={handleOnImageOnClick}
        src={src}
      />
    </>
  );
};

export default Image;
