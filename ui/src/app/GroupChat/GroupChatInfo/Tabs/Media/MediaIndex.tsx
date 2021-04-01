import { IonItemDivider, IonLabel } from "@ionic/react";
import React from "react";
import { FilePayload } from "../../../../../redux/commons/types";
import { IndexedContacts } from "../../../../../redux/contacts/types";
import { Profile } from "../../../../../redux/profile/types";
import MediaItem from "./MediaItem";

interface Props {
  indexedContacts?: IndexedContacts;
  index: string;
  contacts: Profile[];
  onCompletion(contact: Profile): boolean;
  files: FilePayload[];
}

const AddMemberIndex: React.FC<Props> = ({
  index,
  contacts,
  onCompletion,
  indexedContacts,
  files
}) => {
  return (
    <React.Fragment key={index}>
      <IonItemDivider>
        <IonLabel>{index}</IonLabel>
      </IonItemDivider>
      {files.map((file) => (
        <MediaItem
            file={file}
        />
      ))}
    </React.Fragment>
  );
};

export default AddMemberIndex;
