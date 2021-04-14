import { IonText } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import { FilePayload } from "../../../redux/commons/types";
import FileView from "./FileView";
import ImageView from "./ImageView";
import VideoView from "./VideoView";

interface Props {
  timestamp?: Date;
  file?: FilePayload;
  type: "others" | "me";
}

const File: React.FC<Props> = ({ timestamp, file, type }) => {
  const intl = useIntl();
  const decoder = new TextDecoder();

  const renderFile = () => {
    switch (file?.fileType) {
      case "IMAGE":
        return <ImageView file={file} src={decoder.decode(file.thumbnail!)} />;
      case "OTHER":
        return <FileView file={file} />;
      case "VIDEO":
        return <VideoView file={file} />;
      default:
        return null;
    }
  };

  return renderFile();
};

export default File;
