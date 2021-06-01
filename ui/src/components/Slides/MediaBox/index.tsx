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
import ImageView from "../../../components/Chat/File/ImageView/index";
import VideoView from "../../../components/Chat/File/VideoView";
import { FilePayload } from "../../../redux/commons/types";
import { GroupMessage } from "../../../redux/group/types";
import { P2PMessage } from "../../../redux/p2pmessages/types";
import { monthToString } from "../../../utils/helpers";
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
  /* i18n */
  const intl = useIntl();

  /* REFS */
  const infiniteFileScroll = useRef<HTMLIonInfiniteScrollElement>(null);
  const complete = () => infiniteFileScroll.current!.complete();

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
        <VideoView
          file={message.payload as FilePayload}
          onDownload={onDownload}
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
      (message: P2PMessage | GroupMessage) => {
        let month = message.timestamp.getMonth();
        // let year = file.timestamp.getFullYear();
        return (
          <React.Fragment>
            {renderMonth(month)}
            <IonCol size="3">
              <IonCard className={styles.mediacard}>
                <IonCard className={styles.mediacard}>
                  {renderPayload(message)}
                </IonCard>
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
