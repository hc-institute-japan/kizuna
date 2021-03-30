import { IonImg } from "@ionic/react";
import React, { useState } from "react";
import { FilePayload } from "../../../redux/commons/types";

import ImageModal from "./ImageModal";

interface Props {
  src: string;
  file: FilePayload;
}

const Image: React.FC<Props> = ({ src }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOnImageOnClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <ImageModal state={[isOpen, setIsOpen]} src={src}></ImageModal>
      <IonImg onClick={handleOnImageOnClick} src={src} />
    </>
  );
};

export default Image;
