import { IonCol } from "@ionic/react";
import React, { useCallback, useState } from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import MediaItem from "./MediaItem";

interface Props {
  file: FilePayload;
  size?: number;
}

const MediaCol: React.FC<Props> = ({ file, size = 3 }) => {
  const [height, setHeight] = useState(300);
  const handleRef = useCallback((el: HTMLIonColElement) => {
    if (el) {
      if (el.getBoundingClientRect().width !== 0)
        setHeight(el.getBoundingClientRect().width);
    }
  }, []);

  return (
    <IonCol ref={handleRef} size="3" style={{ height }}>
      <MediaItem file={file} />
    </IonCol>
  );
};

export default MediaCol;
