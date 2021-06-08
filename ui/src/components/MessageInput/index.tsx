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
            if (type === "IMAGE") {
              const encoder = new TextEncoder();
              const reader = new FileReader();

              reader.readAsDataURL(file);
              reader.onload = (readerEvent) => {
                const encoded = encoder.encode(
                  readerEvent.target?.result as string
                );

                const final = {
                  metadata: { fileName, fileType: type, fileSize },
                  fileType: { type, payload: { thumbnail: encoded } },
                  fileBytes,
                };

                setFiles((currFiles) => {
                  currFiles.push(final);
                  return [...currFiles];
                });
              };
            } else if (type === "VIDEO") {
              const video = document.createElement("video");
              // const canvas = document.createElement("canvas");
              const url = URL.createObjectURL(
                new Blob([fileBytes], { type: "video/mp4" })
              );
              const BASE_64 = ";base64,";

              const timeUpdate = function () {
                if (snapImage()) {
                  video.removeEventListener("timeupdate", timeUpdate);
                  video.pause();
                }
              };
              video.addEventListener("loadeddata", function () {
                if (snapImage()) {
                  video.removeEventListener("timeupdate", timeUpdate);
                }
              });
              const snapImage = function () {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas
                  .getContext("2d")
                  ?.drawImage(video, 0, 0, canvas.width, canvas.height);

                const image = canvas.toDataURL("image/jpeg");

                const success = image.length > 100000;
                if (success) {
                  const img = document.createElement("img");

                  document.getElementsByTagName("div")[0].appendChild(img);
                  URL.revokeObjectURL(url);
                }

                const base64 = image.split(BASE_64)[1]?.trim();
                if (base64) {
                  const byteCharacters = window.atob(
                    image.split(BASE_64)[1]?.trim()
                  );

                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++)
                    byteNumbers[i] = byteCharacters.charCodeAt(i);

                  const uArr = new Uint8Array(byteNumbers);

                  // });
                  const final = {
                    metadata: { fileName, fileType: type, fileSize },
                    fileType: {
                      type,
                      payload: { thumbnail: uArr },
                    },
                    fileBytes,
                  };
                  setFiles((currFiles) => {
                    currFiles.push(final);
                    return [...currFiles];
                  });
                }
                return success;
              };

              video.src = url;
              video.addEventListener("timeupdate", timeUpdate);
              video.preload = "metadata";
              video.muted = true;
              video.play();
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
          } else
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
        });
      }
    );

  return (
    <IonFooter>
      {files.length > 0 ? <FileView files={files} setFiles={setFiles} /> : null}
      <IonToolbar className={styles.toolbar}>
        <IonButtons slot="start">
          {files.length > 0 ? null : (
            <IonButton onClick={handleOnFileClick}>
              <IonIcon color="medium" icon={attachOutline} />
              <input
                ref={file}
                type="file"
                hidden
                onChange={handleOnFileChange}
              />
            </IonButton>
          )}
        </IonButtons>
        <IonTextarea
          value={message}
          onKeyUp={(event) => {
            if (onSend && event.key === "Enter" && !event.shiftKey) {
              if (message.trim().length !== 0 || files.length > 0) {
                onSend();
                reset();
              }
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              // prevent default behavior
              event.preventDefault();
              //alert("ok");
              return false;
            }
          }}
          className={styles["textarea"]}
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
