import {
    IonImg,
    IonItem,
  } from "@ionic/react";
  import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import File from "./File";
  
  interface Props {
    file?: FilePayload;
  }
  
  const MediaItem: React.FC<Props> = ({ file }) => {
    // const [selectedItem, setSelectedItem] = useState<boolean>(false);
    const decoder = new TextDecoder();

    const renderFile = () => {
        switch (file?.fileType) {
          case "IMAGE":
            return <IonImg src={decoder.decode(file.thumbnail!)} />;
          case "OTHER":
            return <File file={file} />;
          default:
            return null;
        }
      };
  
    // const handleOnClick = () => {
    //   let selected = onCompletion(contact);
    //   if (selected) setSelectedItem(selectedItem ? false : true);
    // };
  
    return (
      <IonItem button lines="none" key={JSON.stringify(file?.fileHash)} >
          {renderFile()}
      </IonItem>
    );
  };
  
  export default MediaItem;
  