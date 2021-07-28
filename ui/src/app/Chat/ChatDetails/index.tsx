import React, { useEffect, useState, useRef } from "react";
import {
  IonPage,
  IonHeader,
  IonSlide,
  IonSlides,
  IonContent,
} from "@ionic/react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { RootState } from "../../../redux/types";
import { Profile } from "../../../redux/profile/types";
import { FilePayload } from "../../../redux/commons/types";
import { P2PHashMap, P2PMessage } from "../../../redux/p2pmessages/types";
import { getNextBatchMessages } from "../../../redux/p2pmessages/actions/getNextBatchMessages";
import { getFileBytes } from "../../../redux/p2pmessages/actions/getFileBytes";
import { useAppDispatch } from "../../../utils/helpers";
// import { useIntl } from "react-intl";

import ContactHeader from "./ContactHeader";
import SegmentTabs from "./SegmentTabs";

import MediaBox from "../../../components/Slides/MediaBox";
import FileBox from "../../../components/Slides/FileBox";
import ProfileInfo from "../../../components/ProfileInfo";

interface Props {
  location: RouteComponentProps<{}, {}, { conversant: Profile }>;
}

const ChatDetails: React.FC<Props> = ({ location }) => {
  /* STATES */
  const { state }: any = { ...location };
  // const intl = useIntl();
  const { conversations, messages } = useSelector(
    (state: RootState) => state.p2pmessages
  );
  const fetchedFiles = useSelector(
    (state: RootState) => state.p2pmessages.files
  );

  const [disableGetNextBatch, setDisableGetNextBatch] =
    useState<boolean>(false);
  const [orderedMedia] = useState<P2PMessage[]>([]);
  const [orderedFiles] = useState<P2PMessage[]>([]);
  const [fileMessageHashes] = useState<{ [key: string]: boolean }>({});
  const [currentSegment, setCurrentSegment] = useState<string>("Info");
  const dispatch = useAppDispatch();

  /* REFS */
  const slideRef = useRef<HTMLIonSlidesElement>(null);

  /* USE EFFECTS */
  /*
    fetches files from hc
    when the page is initially opened
  */
  useEffect(() => {
    dispatch(
      getNextBatchMessages(
        state.conversant.id,
        40,
        "Other",
        undefined,
        undefined
      )
    );
    dispatch(
      getNextBatchMessages(
        state.conversant.id,
        40,
        "Media",
        undefined,
        undefined
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 
    sorts files according to type
    when the redux state for files changes
  */
  useEffect(() => {
    if (
      state.conversant !== undefined &&
      conversations[state.conversant.id] !== undefined
    ) {
      conversations[state.conversant.id].messages.forEach((messageID) => {
        let message = messages[messageID];
        if (message.payload.type === "FILE") {
          let type = message.payload.fileType;

          if (!fileMessageHashes[messageID]) {
            switch (type) {
              case "IMAGE":
                orderedMedia.push(message);
                fileMessageHashes[messageID] = true;
                break;
              case "VIDEO":
                orderedMedia.push(message);
                fileMessageHashes[messageID] = true;
                break;
              case "OTHER":
                orderedFiles.push(message);
                fileMessageHashes[messageID] = true;
                break;
              default:
                break;
            }
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, messages]);

  /* HANDLERS */
  /*
    changes which slide is displayed
    when clicking on a segment
  */
  const handleSegmentChange = (value: any) => {
    let array = ["Info", "Media", "Files"];
    slideRef.current?.slideTo(array.indexOf(value));
  };

  /*
    changes which segment is highlighted
    when the slide is changed
  */
  const handleSlideChange = () => {
    const segmentValues = ["Info", "Media", "Files"];
    slideRef.current
      ?.getActiveIndex()
      .then((currentIndex) => setCurrentSegment(segmentValues[currentIndex]));
  };

  /* 
    downloads a file when already in redux state
    if not, dispatches an action to get the file from hc
    when clicking the file download button
  */
  const handleDownload = (file: FilePayload) => {
    fetchedFiles[file.fileHash] !== undefined
      ? downloadFile(fetchedFiles[file.fileHash], file.fileName)
      : dispatch(getFileBytes([file.fileHash])).then(
          (res: { [key: string]: Uint8Array }) => {
            if (res && Object.keys(res).length > 0) {
              downloadFile(res[file.fileHash], file.fileName);
            }
          }
        );
  };
  const downloadFile = (fileBytes: Uint8Array, fileName: string) => {
    const blob = new Blob([fileBytes]); // change resultByte to bytes
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const handleScrollToBottom = (
    complete: () => Promise<void>,
    earliestMediaOrFile: any
  ) => {
    if (!disableGetNextBatch) {
      let earliest: P2PMessage = earliestMediaOrFile;

      if (earliest !== undefined) {
        dispatch(
          getNextBatchMessages(
            state.conversant.id,
            10,
            (earliest.payload as FilePayload).fileType === "IMAGE" ||
              (earliest.payload as FilePayload).fileType === "VIDEO"
              ? "Media"
              : "Other",
            earliest !== undefined ? earliest.timestamp : undefined,
            earliest !== undefined ? earliest.p2pMessageEntryHash : undefined
          )
        ).then((res: P2PHashMap) => {
          if (Object.values(res)[0][state.conversant.id].length <= 0) {
            setDisableGetNextBatch(true);
          }
          complete();
        });
      }
    }
    complete();
    return;
  };

  // slider options
  const slideOpts = {
    initialSlide: 0,
    speed: 400,
  };

  return (
    <IonPage>
      <IonHeader>
        <ContactHeader profile={state.conversant} />
        <SegmentTabs
          value={currentSegment}
          onSegmentChange={handleSegmentChange}
        />
      </IonHeader>

      <IonContent>
        <IonSlides
          ref={slideRef}
          className="slides"
          pager={false}
          options={slideOpts}
          onIonSlideDidChange={handleSlideChange}
        >
          {/* Contact Info */}
          {/* TODO: change to empty component for now */}
          <IonSlide>
            <ProfileInfo
              nickname={state.conversant.username}
              id={state.conversant.id}
            />
          </IonSlide>

          {/* Media */}
          <MediaBox
            orderedMediaMessages={orderedMedia}
            onDownload={(file: FilePayload) => handleDownload(file)}
            onScrollBottom={(complete, earliestMedia) =>
              handleScrollToBottom(complete, earliestMedia)
            }
          />

          {/* Files */}
          <FileBox
            orderedFileMessages={orderedFiles}
            onDownload={(file) => handleDownload(file)}
            onScrollBottom={(complete, earliestFile) =>
              handleScrollToBottom(complete, earliestFile)
            }
          />
        </IonSlides>
      </IonContent>
    </IonPage>
  );
};

export default ChatDetails;
