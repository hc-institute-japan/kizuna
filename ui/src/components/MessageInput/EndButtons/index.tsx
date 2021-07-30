import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { send } from "ionicons/icons";
import React from "react";
import { FileContent } from "..";
import Spinner from "../../Spinner";

interface Props {
  files: FileContent[];
  message: string;
  onSend?(): any;
  loading: boolean;
}

const EndButtons: React.FC<Props> = ({ message, files, onSend, loading }) => (
  <IonButtons slot="end">
    {/* {message.length > 0 ? null : (
      <>
        <IonButton>
          <IonIcon color="medium" icon={camera} />
        </IonButton>
        <IonButton>
          <IonIcon color="medium" icon={mic} />
        </IonButton>
      </>
    )} */}
    <IonButton
      type="submit"
      onClick={onSend}
      disabled={message.length === 0 && files.length === 0}
    >
      {loading ? <Spinner /> : <IonIcon color="medium" icon={send} />}
    </IonButton>
  </IonButtons>
);

export default EndButtons;
