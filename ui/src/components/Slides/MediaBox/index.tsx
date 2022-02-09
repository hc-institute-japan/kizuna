import {
  IonCard,
  IonCol,
  IonGrid,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRow,
  IonSlide,
} from "@ionic/react";
import React, { useRef } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import ImageView from "../../../components/Chat/File/ImageView/index";
import { FilePayload, isP2PMessage } from "../../../redux/commons/types";
import { fetchFilesBytes } from "../../../redux/group/actions";
import { GroupMessage } from "../../../redux/group/types";
import { getFileBytes } from "../../../redux/p2pmessages/actions/getFileBytes";
import { P2PMessage } from "../../../redux/p2pmessages/types";
import { RootState } from "../../../redux/types";
import { monthToString } from "../../../utils/services/DateService";
import { useAppDispatch } from "../../../utils/services/ReduxService";
import VideoPlayer from "../../VideoPlayer";
import styles from "../style.module.css";

interface Props {
  orderedMediaMessages: P2PMessage[] | GroupMessage[];
  onDownload(file: FilePayload): any;
  onScrollBottom(
    complete: () => Promise<void>,
    earliestMedia: P2PMessage | GroupMessage
  ): any;
}

/*
	displays the grid of files
	or the conversant's details (TODO)
*/
const FileBox: React.FC<Props> = ({
  orderedMediaMessages,
  onDownload,
  onScrollBottom,
}) => {
  const dispatch = useAppDispatch();
  /* Selectors */
  /* 
    We are retrieving the store that contains 
    the file bytes of all files both for p2p and group
  */
  const filesBytes = useSelector((state: RootState) => {
    let fileSet = Object.assign(
      {},
      state.groups.groupFiles,
      state.p2pmessages.files
    );
    return fileSet;
    // return state.groups.groupFiles[`u${file.fileHash}`];
  });

  /* i18n */
  const intl = useIntl();

  /* REFS */
  const infiniteFileScroll = useRef<HTMLIonInfiniteScrollElement>(null);
  const complete: () => any = () => infiniteFileScroll.current?.complete();

  // helper code for displaying date
  const decoder = new TextDecoder();
  let currentMonth = -1;

  /* RENDERER */
  const renderMonth = (month: number) =>
    month !== currentMonth
      ? ((currentMonth = month),
        (
          <IonCol size="12">
            <h2 className={styles.month}>{monthToString(month, intl)}</h2>
          </IonCol>
        ))
      : null;

  const renderPayload = (message: P2PMessage | GroupMessage) =>
    (message.payload as FilePayload).fileType === "VIDEO" ? (
      <div className={styles.mediadiv}>
        <VideoPlayer
          download={() => onDownload(message.payload as FilePayload)}
          src={URL.createObjectURL(
            new Blob([filesBytes[(message.payload as FilePayload).fileHash!]], {
              type: "video/mp4",
            })
          )}
          className={styles.video}
          thumbnail={URL.createObjectURL(
            new Blob(
              [(message.payload as FilePayload).thumbnail as Uint8Array],
              { type: "image/jpeg" }
            )
          )}
          /* TODO: We should expose onPlayPauseErrorHandler as prop instead of directly handling it here. */
          onPlayPauseErrorHandler={(setErrorState: any) => {
            if (isP2PMessage(message)) {
              dispatch(
                getFileBytes([(message.payload as FilePayload).fileHash!])
              ).then((res: any) => {
                if (res) {
                  setErrorState(false);
                }
              });
            } else {
              dispatch(
                fetchFilesBytes([(message.payload as FilePayload).fileHash!])
              ).then((res: any) => {
                if (res) {
                  setErrorState(false);
                }
              });
            }
          }}
        />
      </div>
    ) : (
      <div className={styles.mediadiv}>
        <ImageView
          file={message.payload as FilePayload}
          src={decoder.decode((message.payload as FilePayload).thumbnail!)}
          onDownload={onDownload}
        />
      </div>
    );

  const renderMediaMessages = () =>
    /* 
			the orderedFileMessages is declared as any[] here as a union of array is uncallable.
			see https://github.com/microsoft/TypeScript/issues/36390 for more info
    */
    (orderedMediaMessages as any[]).map(
      (message: P2PMessage | GroupMessage, i) => {
        let month = message.timestamp.getMonth();
        // let year = file.timestamp.getFullYear();
        return (
          <React.Fragment key={i}>
            {renderMonth(month)}
            <IonCol size="3">
              <IonCard className={styles.mediacard}>
                {renderPayload(message)}
              </IonCard>
            </IonCol>
          </React.Fragment>
        );
      }
    );

  /* RENDER */
  return (
    <IonSlide>
      <IonGrid>
        <IonRow className={styles.mediarow}>{renderMediaMessages()}</IonRow>

        <IonRow>
          <IonInfiniteScroll
            ref={infiniteFileScroll}
            position="bottom"
            onIonInfinite={
              (e) =>
                onScrollBottom(
                  complete,
                  orderedMediaMessages[orderedMediaMessages.length - 1]
                ) // maybe return just the earliest
            }
          >
            <IonInfiniteScrollContent></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </IonRow>
      </IonGrid>
    </IonSlide>
  );
};

export default FileBox;
