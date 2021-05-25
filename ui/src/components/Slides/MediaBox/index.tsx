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
import VideoView from "../../../components/Chat/File/VideoView";
import { FilePayload } from "../../../redux/commons/types";
import { GroupMessage } from "../../../redux/group/types";
import { getFileBytes } from "../../../redux/p2pmessages/actions";
import { P2PMessage } from "../../../redux/p2pmessages/types";
import { Profile } from "../../../redux/profile/types";
import { RootState } from "../../../redux/types";
import {
  base64ToUint8Array,
  monthToString,
  useAppDispatch,
} from "../../../utils/helpers";
import styles from "../style.module.css";

interface Props {
  type: "media" | "files";
  conversant: Profile;
  orderedMediaMessages: P2PMessage[] | GroupMessage[];
  onDownload(file: FilePayload): any;
  onScrollBottom(
    complete: () => Promise<void>,
    files: P2PMessage[] | GroupMessage[]
  ): any;
}

/*
	displays the grid of files
	or the conversant's details (TODO)
*/
const FileBox: React.FC<Props> = ({
  type,
  orderedMediaMessages,
  conversant,
  onDownload,
  onScrollBottom,
}) => {
  const dispatch = useAppDispatch();
  const fetchedFiles = useSelector(
    (state: RootState) => state.p2pmessages.files
  );

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
    orderedMediaMessages.map((message: P2PMessage | GroupMessage) => {
      // fetch video filebytes if not yet in redux
      // temp fix. most likely will change when this gets turned into a component
      // TODO: fix the "u" append thing so that this component can be used both for P2P and Group
      // TODO: find a better way to fix this problem than this current fix
      if (
        (message.payload as FilePayload).fileType === "VIDEO" &&
        fetchedFiles["u" + (message.payload as FilePayload).fileHash] ===
          undefined
      ) {
        dispatch(
          getFileBytes([
            base64ToUint8Array((message.payload as FilePayload).fileHash),
          ])
        );
      }

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
    });

  /* RENDER */
  return (
    <IonSlide>
      <IonGrid>
        <IonRow className={styles.mediarow}>{renderMediaMessages()}</IonRow>

        <IonRow>
          <IonInfiniteScroll
            ref={infiniteFileScroll}
            position="bottom"
            onIonInfinite={(e) =>
              onScrollBottom(complete, orderedMediaMessages)
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
