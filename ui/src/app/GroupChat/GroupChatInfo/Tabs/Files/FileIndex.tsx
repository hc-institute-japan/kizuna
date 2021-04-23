import { IonListHeader } from "@ionic/react";
import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import { GroupMessage } from "../../../../../redux/group/types";
import { Profile } from "../../../../../redux/profile/types";
import FileItem from "./FileItem";
import styles from "../../style.module.css";

interface Props {
  indexedFileMessages?: {
    [key: string]: GroupMessage[];
  };
  index: string;
  fileMessages: GroupMessage[];
  onCompletion(contact: Profile): boolean;
  files: FilePayload[];
}

const FileIndex: React.FC<Props> = ({
  index,
  files
}) => {
  return (
    <React.Fragment key={index}>
      <IonListHeader className={styles["month"]}>{index}</IonListHeader>
        {files.map((file) => <FileItem file={file}/>)}
    </React.Fragment>
  );
};

export default FileIndex;
