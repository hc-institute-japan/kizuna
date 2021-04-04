import { IonItem } from "@ionic/react";
  import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import FileView from "./FileView";
  
  interface Props {
    file?: FilePayload;
  }
  
  const FileItem: React.FC<Props> = ({ file }) => {
    const renderFile = () => {
      switch (file?.fileType) {
        case "OTHER":
          return <FileView file={file} />;
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
  
    return (
      <IonItem button　lines="none" key={JSON.stringify(file?.fileHash)} >
          {renderFile()}
      </IonItem>
    );
  };
  
  export default FileItem;
  