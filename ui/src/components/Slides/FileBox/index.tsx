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
import { FilePayload } from "../../../redux/commons/types";
import { GroupMessage } from "../../../redux/group/types";
import { P2PMessage } from "../../../redux/p2pmessages/types";
import { monthToString } from "../../../utils/services/DateService";
import FileView from "../../Chat/File/FileView";
import styles from "../style.module.css";

interface Props {
  orderedFileMessages: P2PMessage[] | GroupMessage[];
  onDownload(file: FilePayload): any;
  onScrollBottom(
    complete: () => Promise<void>,
    earliestFile: P2PMessage | GroupMessage
  ): any;
}

/* displays the grid of files */
const FileBox: React.FC<Props> = ({
  orderedFileMessages,
  onDownload,
  onScrollBottom,
}) => {
  /* i18n */
  const intl = useIntl();

  /* REFS */
  const infiniteFileScroll = useRef<HTMLIonInfiniteScrollElement>(null);
  const complete: () => any = () => infiniteFileScroll.current?.complete();

  // determines the size of the grid columns
  // whole page width for others (looks like list)

  // helper code for displaying date
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

  const renderFileMessages = () => {
    /* 
			the orderedFileMessages is declared as any[] here as a union of array is uncallable.
			see https://github.com/microsoft/TypeScript/issues/36390 for more info
		*/
    return (orderedFileMessages as any[]).map(
      (message: P2PMessage | GroupMessage) => {
        let month = message.timestamp.getMonth();
        // let year = file.timestamp.getFullYear();
        return (
          <React.Fragment>
            {renderMonth(month)}
            <IonCol size="12">
              <IonCard className={styles.mediacard}>
                <FileView
                  file={message.payload as FilePayload}
                  onDownload={onDownload}
                  darken={true}
                />
              </IonCard>
            </IonCol>
          </React.Fragment>
        );
      }
    );
  };

  /* RENDER */
  return (
    <IonSlide>
      <IonGrid>
        <IonRow className={styles.mediarow}>{renderFileMessages()}</IonRow>

        <IonRow>
          <IonInfiniteScroll
            ref={infiniteFileScroll}
            position="bottom"
            onIonInfinite={(e) =>
              onScrollBottom(
                complete,
                orderedFileMessages[orderedFileMessages.length - 1]
              )
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
