import { IonCard, IonItem } from "@ionic/react";
  import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import FileView from "./FileView";
import styles from "../../style.module.css";
  
  interface Props {
    file?: FilePayload;
  }
  
  const FileItem: React.FC<Props> = ({ file }) => {
    const renderFile = () => {
      switch (file?.fileType) {
        case "OTHER":
          return (
            <IonItem button　lines="none" key={JSON.stringify(file?.fileHash)}>
              <IonCard className={styles.filecard}>
                <FileView file={file} />
              </IonCard>
            </IonItem>
            );
        case "IMAGE":
          return null;
        case "VIDEO":
            return null;
        default:
          return null;
      }
    };
    
  
    // const handleOnClick = () => {
    //   let selected = onCompletion(contact);
    //   if (selected) setSelectedItem(selectedItem ? false : true);
    // };
  
    return (renderFile());
  };
  
  export default FileItem;
  