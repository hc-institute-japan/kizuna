import {
  IonButton,
  IonButtons,
  IonFooter,
  IonIcon,
  IonTextarea,
  IonToolbar,
} from "@ionic/react";
import { attachOutline } from "ionicons/icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  // too lazy to do all
  // url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

  switch (type) {
    case "video/mpeg":
    case "video/mp4":
      return "VIDEO";
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

  const onFileSelectCallback = useCallback(() => {
    if (onFileSelect) onFileSelect(files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const onChangeCallback = useCallback(() => {
    if (onChange) onChange(message);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const reset = () => {
    setMessage("");
    setFiles([]);
  };

  useEffect(() => {
    onFileSelectCallback();
  }, [files, onFileSelectCallback]);
  useEffect(() => {
    onChangeCallback();
  }, [message, onChangeCallback]);
  const { showToast } = useToast();

  const handleOnFileChange = () =>
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
              const encoder = new TextEncoder();
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = (readerEvent) => {
                const encoded = encoder.encode(
                  readerEvent.target?.result as string
                );

                const final = {
                  metadata: { fileName, fileType: type, fileSize },
                  fileType: { type, payload: {thumbnail: encoded} },
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
                fileType: { type, payload: null },
                fileBytes,
              };
              setFiles((currFiles) => {
                currFiles.push(final);
                return [...currFiles];
              });
            }
          } else {
            showToast({
              message: intl.formatMessage(
                {
                  id: "components.message-input.over-size-limit",
                },
                { fileName }
              ),
              color: "danger",
              duration: 2500,
            });
          }
        });
      }
    );

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
          value={message}
          onIonChange={handleOnChange}
          autoGrow={true}
          placeholder={intl.formatMessage({
            id: "app.new-conversation.message-placeholder",
          })}
        />
        <EndButtons
          files={files}
          onSend={() => {
            if (onSend) onSend();
            reset();
          }}
          message={message}
        />
      </IonToolbar>
    </IonFooter>
  );
};

export default MessageInput;
