import React, { useEffect, useState, useRef } from "react";
import {
  IonPage,
  IonButtons,
  IonBackButton,
  IonText,
  IonTitle,
  IonHeader,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonListHeader,
  IonItem,
  IonSlide,
  IonSlides,
  IonContent,
  IonCard,
  IonCardContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";
import { Profile } from "../../../redux/profile/types";
import {
  P2PMessage,
  P2PMessageConversationState,
} from "../../../redux/p2pmessages/types";
import { FilePayload } from "../../../redux/commons/types";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/types";
import styles from "./style.module.css";
import { RouteComponentProps } from "react-router";
import ImageView from "../../../components/Chat/File/ImageView/index";
import VideoView from "../../../components/Chat/File/VideoView";
import FileView from "../../../components/Chat/File/FileView";

import {
  useAppDispatch,
  base64ToUint8Array,
  dateToTimestamp,
} from "../../../utils/helpers";
import { getNextBatchMessages } from "../../../redux/p2pmessages/actions";

interface Props {
  location: RouteComponentProps<{}, {}, { conversant: Profile }>;
}

const ChatDetails: React.FC<Props> = ({ location }) => {
  const { state }: any = { ...location };
  const { conversations, messages, receipts } = useSelector(
    (state: RootState) => state.p2pmessages
  );
  const [media, setMedia] = useState<{ [key: string]: boolean }>({});
  const [files, setFiles] = useState<{ [key: string]: P2PMessage }>({});
  const [orderedMedia, setOrderedMedia] = useState<P2PMessage[]>([]);
  const [orderedFiles, setOrderedFiles] = useState<P2PMessage[]>([]);

  const dispatch = useAppDispatch();

  const slideOpts = {
    initialSlide: 0,
    speed: 400,
  };

  const slideRef = React.createRef<HTMLIonSlidesElement>();

  useEffect(() => {
    if (
      state.conversant !== undefined &&
      conversations["u" + state.conversant.id] !== undefined
    ) {
      conversations["u" + state.conversant.id].messages.forEach((messageID) => {
        let message = messages[messageID];
        if (message.payload.type === "FILE") {
          let payload = message.payload;
          let type = message.payload.fileType;

          switch (type) {
            case "IMAGE":
              if (!media[message.p2pMessageEntryHash]) {
                media[message.p2pMessageEntryHash] = true;
                orderedMedia.push(message);
              }
              break;
            case "VIDEO":
              if (!media[message.p2pMessageEntryHash]) {
                media[message.p2pMessageEntryHash] = true;
                orderedMedia.push(message);
              }
              break;
            case "OTHER":
              if (!files[message.p2pMessageEntryHash]) {
                files[message.p2pMessageEntryHash] = message;
                orderedFiles.push(message);
              }
              break;
            default:
              break;
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, messages]);

  const handleOnSegmentChange = (value: any) => {
    var index;
    switch (value) {
      case "Info":
        index = 0;
        break;
      case "Media":
        index = 1;
        break;
      case "Files":
        index = 2;
        break;
      default:
        return;
    }
    slideRef.current?.slideTo(index);
  };

  const renderOther = (other: any) => {
    let payload: FilePayload = other.payload;
    let { 0: type, 1: metadata } = Object.values(payload);
    let { fileName, fileSize, fileType, fileHash } = metadata;
    return (
      <IonItem color="primary" lines="full">
        <IonLabel>{fileName}</IonLabel>
        <IonLabel>
          <h4>{fileSize}</h4>
          <p>{fileType}</p>
        </IonLabel>
      </IonItem>
    );
  };

  const infiniteFileScroll = useRef<HTMLIonInfiniteScrollElement>(null);
  const infiniteFileScroll2 = useRef<HTMLIonInfiniteScrollElement>(null);
  const complete = () => infiniteFileScroll.current!.complete();
  const complete2 = () => infiniteFileScroll2.current!.complete();

  // const onScrollBottom = (complete: () => Promise<void>, files: {[key:string]: P2PMessage}) => {
  const onScrollBottom = (
    complete: () => Promise<void>,
    files: P2PMessage[]
  ) => {
    // console.log("Details scrolls");
    // var lastFile: P2PMessage = Object.values(files)[Object.entries(files).length - 1];
    var lastFile: P2PMessage = files[files.length - 1];
    // console.log("Details last file", lastFile);
    dispatch(
      getNextBatchMessages({
        conversant: Buffer.from(base64ToUint8Array(state.conversant.id)),
        batch_size: 3,
        payload_type: "File",
        last_fetched_timestamp:
          lastFile !== undefined
            ? dateToTimestamp(lastFile.timestamp)
            : undefined,
        last_fetched_message_id:
          lastFile !== undefined
            ? Buffer.from(
                base64ToUint8Array(lastFile.p2pMessageEntryHash.slice(1))
              )
            : undefined,
      })
    );
    complete();
    return;
  };

  const decoder = new TextDecoder();

  const monthText = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  var currentMonth = -1;
  var currentMonth2 = -1;
  return (
    <IonPage>
      <IonHeader>
        <div>
          <IonToolbar className={styles.controls}>
            <span>
              <IonButtons slot="start">
                <IonBackButton
                  defaultHref={`/u/${state.conversant.username}`}
                  className="ion-no-padding"
                />
              </IonButtons>
            </span>
          </IonToolbar>
          <div className={styles.titlebar}>
            {/* <IonText className={styles.title}>{state.conversant.username}</IonText> */}
            <p className={styles.title}>{state.conversant.username}</p>
          </div>
        </div>
        <IonToolbar>
          <IonSegment
            onIonChange={(e) => handleOnSegmentChange(e.detail.value)}
          >
            <IonSegmentButton value="Info">
              <IonLabel>Info</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Media">
              <IonLabel>Media</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Files">
              <IonLabel>Files</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonSlides
          ref={slideRef}
          className="slides"
          pager={false}
          options={slideOpts}
        >
          <IonSlide>
            <IonGrid>
              <IonRow></IonRow>
            </IonGrid>
          </IonSlide>

          <IonSlide>
            <IonGrid>
              <IonRow className={styles.mediarow}>
                {orderedMedia.map((file) => {
                  let month = file.timestamp.getMonth();
                  let year = file.timestamp.getFullYear();
                  return (
                    <React.Fragment>
                      {month !== currentMonth
                        ? ((currentMonth = month),
                          (
                            <IonCol size="12">
                              <h2 className={styles.month}>
                                {monthText[month]}
                              </h2>
                            </IonCol>
                          ))
                        : null}
                      <IonCol size="3">
                        <IonCard className={styles.mediacard}>
                          {(file.payload as FilePayload).fileType ===
                          "VIDEO" ? (
                            <div className={styles.mediadiv}>
                              <VideoView file={file.payload as FilePayload} />
                            </div>
                          ) : (
                            <div className={styles.mediadiv}>
                              <ImageView
                                file={file.payload as FilePayload}
                                src={decoder.decode(
                                  (file.payload as FilePayload).thumbnail!
                                )}
                              />
                            </div>
                          )}
                        </IonCard>
                      </IonCol>
                    </React.Fragment>
                  );
                })}
              </IonRow>
              <IonRow>
                <IonInfiniteScroll
                  ref={infiniteFileScroll}
                  position="bottom"
                  onIonInfinite={(e) => onScrollBottom(complete, orderedMedia)}
                >
                  <IonInfiniteScrollContent></IonInfiniteScrollContent>
                </IonInfiniteScroll>
              </IonRow>
            </IonGrid>
          </IonSlide>

          <IonSlide>
            <IonList className={styles.filelist}>
              {orderedFiles.map((file) => {
                let month = file.timestamp.getMonth();
                let year = file.timestamp.getFullYear();
                return (
                  <React.Fragment>
                    {month !== currentMonth2
                      ? ((currentMonth2 = month),
                        (
                          <IonListHeader>
                            <h2 className={styles.month}>{monthText[month]}</h2>
                          </IonListHeader>
                        ))
                      : null}
                    <IonItem>
                      <IonCard className={styles.filecard}>
                        <FileView file={file.payload as FilePayload} />
                      </IonCard>
                    </IonItem>
                  </React.Fragment>
                );
              })}
              <IonInfiniteScroll
                ref={infiniteFileScroll2}
                position="bottom"
                onIonInfinite={(e) => onScrollBottom(complete2, orderedFiles)}
              >
                <IonInfiniteScrollContent></IonInfiniteScrollContent>
              </IonInfiniteScroll>
            </IonList>
          </IonSlide>
        </IonSlides>
      </IonContent>
    </IonPage>
  );
};

export default ChatDetails;
