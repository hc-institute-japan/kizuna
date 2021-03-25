import { IonImg } from "@ionic/react";
import React from "react";
import { FilePayload } from "../../../../redux/commons/types";

interface Props {
  src: string;
  file: FilePayload;
}

const Image: React.FC<Props> = ({ src }) => <IonImg src={src} />;

export default Image;
