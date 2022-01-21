import {
  IonButton,
  IonButtons,
  IonFooter,
  IonIcon,
  IonTextarea,
  IonToolbar,
} from "@ionic/react";
import { attachOutline } from "ionicons/icons";
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { useToast } from "../../containers/ToastContainer/context";
import { Payload } from "../../redux/commons/types";
import EndButtons from "./EndButtons";
import FileView from "./FileView";
import ReplyView from "./ReplyView";
import GifKeyboard from "../Gif/GifKeyboard";
import styles from "./style.module.css";

export interface FileContent {
  metadata: {
    fileName: string;
    fileType: "VIDEO" | "IMAGE" | "OTHER";
    fileSize: number;
  };
  fileType: {
    type: "VIDEO" | "IMAGE" | "OTHER";
    payload?: { thumbnail: Uint8Array };
  };
  fileBytes: Uint8Array;
}

export interface MessageInputOnSendParams {
  message?: string;
  files?: FileContent[];
  reply?: string;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ReplyParams {
  payload: Payload;
  author: string;
  id: string;
}

interface Props {
  onChange?: (message: string) => any;
  onSend?: (opt?: MessageInputOnSendParams) => any;
  onFileSelect?: (e: FileContent[]) => any;
}

export interface MessageInputMethods {
  reply: (message: { payload: Payload; author: string; id: string }) => any;
}

const determineFileType = (type: string): "VIDEO" | "IMAGE" | "OTHER" => {
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

const MessageInput: ForwardRefRenderFunction<MessageInputMethods, Props> = (
  { onChange, onSend, onFileSelect },
  ref
) => {
  const [message, setMessage] = useState("");
  const handleOnChange = (e: CustomEvent) => setMessage(e.detail.value!);
  const intl = useIntl();
  const [isReply, setIsReply] = useState<ReplyParams | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [onComposition, setOnComposition] = useState<boolean>(false);
  const file = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileContent[]>([]);
  const [selectedGif, setSelectedGif] = useState("");
  const handleOnFileClick = () => file?.current?.click();

  const [showGifs, setShowGifs] = useState<boolean>(false);

  const onFileSelectCallback = useCallback(() => {
    if (onFileSelect) onFileSelect(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useImperativeHandle(ref, () => ({
    reply: (message: any) => {
      setIsReply(message);
    },
  }));

  const onChangeCallback = useCallback(() => {
    if (onChange) onChange(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const onGifSelectCallback = useCallback(() => {
    if (onSend && selectedGif !== "") {
      onSend({
        message: selectedGif,
        // reply: isReply?.id,
        setIsLoading: setLoading,
      });
      setShowGifs(!showGifs);
      reset();
    }
  }, [selectedGif]);

  const reset = () => {
    setIsReply(undefined);
    setMessage("");
    setFiles([]);
    if (file.current) file.current!.value = "";
  };

  const handleOnGifClick = () => {
    setShowGifs(!showGifs);
  };

  const handleOnGifSelect = (url: string) => {
    setSelectedGif(url);
    // if (onSend && message.trim().length !== 0) {
    //   onSend({
    //     message: url,
    //     // reply: isReply?.id,
    //     setIsLoading: setLoading,
    //   });
    //   reset();
    // }
  };

  const handleComposition = (event: CompositionEvent) => {
    if (event.type === "compositionstart") {
      setOnComposition(true);
    }
    if (event.type === "compositionend") {
      setOnComposition(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    console.log(onComposition);
    if (onSend && event.key === "Enter" && !event.shiftKey && !onComposition) {
      if (message.trim().length !== 0 || files.length > 0) {
        onSend({
          files,
          message,
          reply: isReply?.id,
          setIsLoading: setLoading,
        });
        reset();
      }
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSend, reset]);
  useEffect(() => onFileSelectCallback(), [files, onFileSelectCallback]);
  useEffect(() => onChangeCallback(), [message, onChangeCallback]);
  useEffect(() => onGifSelectCallback(), [selectedGif, onGifSelectCallback]);
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

              const snapImage = (): boolean => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas
                  .getContext("2d")
                  ?.drawImage(video, 0, 0, canvas.width, canvas.height);

                const image = canvas.toDataURL("image/jpeg");

                const success = image.length > 10;
                if (success) {
                  const img = document.createElement("img");

                  document.getElementsByTagName("div")[0].appendChild(img);
                  URL.revokeObjectURL(url);

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
                fileType: { type },
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
  };

  const renderFileView = useMemo(
    () =>
      files.length > 0 ? (
        <FileView file={file.current} files={files} setFiles={setFiles} />
      ) : null,
    [files]
  );

  return (
    <>
      <IonFooter>
        {showGifs ? <GifKeyboard onSelect={handleOnGifSelect} /> : null}
        {isReply ? <ReplyView messageState={[isReply, setIsReply]} /> : null}
        {renderFileView}
        <IonToolbar className={styles.toolbar}>
          <IonButtons slot="start">
            {files.length > 0 ? null : (
              <IonButton onClick={handleOnFileClick}>
                <IonIcon color="medium" icon={attachOutline} />
              </IonButton>
            )}
            <IonButton onClick={handleOnGifClick}>
              <IonIcon color="medium" icon="assets/icon/gif.svg" />
            </IonButton>
          </IonButtons>
          <IonTextarea
            value={message}
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
            ref={(el) => {
              if (el) {
                el.addEventListener("compositionstart", handleComposition);
                el.addEventListener("compositionend", handleComposition);
              }
            }}
          />
          <EndButtons
            files={files}
            onSend={() => {
              if (onSend) {
                onSend({
                  files,
                  message,
                  reply: isReply?.id,
                  setIsLoading: setLoading,
                });
              }
              reset();
            }}
            message={message}
            loading={loading}
          />
        </IonToolbar>
      </IonFooter>
      <input ref={file} type="file" hidden onChange={handleOnFileChange} />
    </>
  );
};

export default forwardRef(MessageInput);
