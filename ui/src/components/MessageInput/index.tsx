import {
  IonButton,
  IonButtons,
  IonFooter,
  IonIcon,
  IonTextarea,
  IonToolbar,
} from "@ionic/react";
import { attachOutline } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useToast } from "../../containers/ToastContainer/context";
import EndButtons from "./EndButtons";
import FileView from "./FileView";
import styles from "./style.module.css";

interface Props {
  onChange?: (message: string) => any;
  onSend?: () => any;
  onFileSelect?: (e: any[]) => any;
}

const determineFileType = (type: string): string => {
  //too lazy to do all
  //url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

  switch (type) {
    case "image/png":
    case "image/jpeg":
      return "IMAGE";
    default:
      return "OTHER";
  }
};

const MessageInput: React.FC<Props> = ({ onChange, onSend, onFileSelect }) => {
  const [message, setMessage] = useState("");
  const handleOnChange = (e: CustomEvent) => setMessage(e.detail.value!);
  const intl = useIntl();
  const file = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<any[]>([]);
  const handleOnFileClick = () => file?.current?.click();

  useEffect(() => {
    if (onFileSelect) onFileSelect(files);
  }, [files, onFileSelect]);
  useEffect(() => {
    if (onChange) onChange(message);
  }, [message, onChange]);
  const { showToast } = useToast();

  const handleOnFileChange = () => {
    Array.from(file.current ? file.current.files! : new FileList()).forEach(
      (file) => {
        file.arrayBuffer().then((arrBuffer) => {
          const fileSize = file.size;
          const fileName = file.name;
          // 15mb = 15728640b, file.size is of type bytes
          if (fileSize < 15728640) {
            const fileBytes = new Uint8Array(arrBuffer);
            const type = determineFileType(file.type);

            if (type === "IMAGE" || type === "VIDEO") {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = (readerEvent) => {
                const final = {
                  metadata: { fileName, fileType: type, fileSize },
                  fileType: { type, thumbnail: readerEvent.target?.result },
                  fileBytes,
                };

                setFiles((currFiles) => {
                  currFiles.push(final);
                  return [...currFiles];
                });
              };
            } else {
              const final = {
                metadata: { fileName, fileType: type, fileSize },
                fileType: { type },
                fileBytes,
              };

              setFiles((currFiles) => {
                currFiles.push(final);
                return [...currFiles];
              });
            }
          } else {
            showToast({
              message: `${fileName} exceeds the 15mb file limit`,
              color: "danger",
              duration: 2500,
            });
          }
        });
      }
    );
  };

  return (
    <IonFooter>
      {files.length > 0 ? <FileView files={files} setFiles={setFiles} /> : null}
      <IonToolbar className={styles.toolbar}>
        <IonButtons slot="start">
          <IonButton onClick={handleOnFileClick}>
            <IonIcon color="medium" icon={attachOutline} />
            <input
              ref={file}
              multiple
              type="file"
              hidden
              onChange={handleOnFileChange}
            />
          </IonButton>
        </IonButtons>
        <IonTextarea
          onIonChange={handleOnChange}
          autoGrow={true}
          placeholder={intl.formatMessage({
            id: "app.new-conversation.message-placeholder",
          })}
        />
        <EndButtons files={files} onSend={onSend} message={message} />
      </IonToolbar>
    </IonFooter>
  );
};

export default MessageInput;
