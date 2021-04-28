import { IonCol } from "@ionic/react";
import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import MediaItem from "./MediaItem";

interface Props {
  file: FilePayload;
  size?: number;
}

const MediaCol: React.FC<Props> = ({ file, size = 3 }) => {
  return (
    <IonCol size="3">
      <MediaItem file={file} />
    </IonCol>
  );
};

export default MediaCol;
