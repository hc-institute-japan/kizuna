import React from "react";
import { FilePayload } from "../../../redux/commons/types";
import FileView from "./FileView";
import ImageView from "./ImageView";
import VideoView from "./VideoView";

interface Props {
  timestamp?: Date;
  file?: FilePayload;
  type: "others" | "me";
  onDownload?(file: FilePayload): any;
}

const File: React.FC<Props> = ({ timestamp, file, type, onDownload }) => {
  const decoder = new TextDecoder("utf-8");

  const renderFile = () => {
    switch (file?.fileType) {
      case "IMAGE":
        return (
          <ImageView
            onDownload={onDownload}
            file={file}
            src={decoder.decode(file.thumbnail!)}
          />
        );
      case "OTHER":
        return <FileView onDownload={onDownload} file={file} />;
      case "VIDEO":
        return <VideoView onDownload={onDownload} file={file} />;
      default:
        return null;
    }
  };

  return renderFile();
};

export default File;
