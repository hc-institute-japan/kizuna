import React from "react";
import { FilePayload } from "../../../redux/commons/types";
import { fetchFilesBytes } from "../../../redux/group/actions/setFilesBytes";
import { useAppDispatch } from "../../../utils/helpers";
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
  const dispatch = useAppDispatch();

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
        return (
          <VideoView
            onDownload={onDownload}
            file={file}
            onPlayPauseErrorHandler={(setErrorState: any) => {
              dispatch(fetchFilesBytes([file.fileHash])).then((res: any) => {
                if (res) {
                  setErrorState(false);
                }
              });
            }}
          />
        );
      default:
        return null;
    }
  };

  return renderFile();
};

export default File;
