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
import { P2PMessage } from "../../../redux/p2pmessages/types";
import { getNextBatchMessages, getFileBytes } from "../../../redux/p2pmessages/actions";
import { useAppDispatch, base64ToUint8Array } from "../../../utils/helpers";
// import { useIntl } from "react-intl";

import ContactHeader from "./ContactHeader";
import SegmentTabs from "./SegmentTabs";
import FileBox from "./FileBox";

interface Props {
  location: RouteComponentProps<{}, {}, { conversant: Profile }>;
}

const ChatDetails: React.FC<Props> = ({ location }) => {
  /* STATES */
  const { state }: any = { ...location };
  // const intl = useIntl();
  const { conversations, messages } = useSelector((state: RootState) => state.p2pmessages);
  const fetchedFiles = useSelector((state: RootState) => state.p2pmessages.files);
  const [ media ] = useState< { [key: string]: boolean }>({});
  const [ files ] = useState< { [key: string]: P2PMessage }>({});
  const [ orderedMedia ] = useState<P2PMessage[]>([]);
  const [ orderedFiles ] = useState<P2PMessage[]>([]);
  const [ currentSegment, setCurrentSegment ] = useState<string>("Info");
  const dispatch = useAppDispatch();

  /* REFS */
  const slideRef = useRef<HTMLIonSlidesElement>(null);

  /* USE EFFECTS */
  /*
    fetches files from hc
    when the page is initially opened
  */
  useEffect(() => {
    let initialFetchFilter = {
      conversant: Buffer.from(base64ToUint8Array(state.conversant.id)),
      batch_size: 40,
      payload_type: "File",
      last_fetched_timestamp: undefined,
      last_fetched_message_id: undefined
    };
    dispatch(
      getNextBatchMessages(initialFetchFilter)
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 
    sorts files according to type
    when the redux state for files changes
  */
  useEffect(() => {
    if (
      state.conversant !== undefined &&
      conversations["u" + state.conversant.id] !== undefined
    ) {
      conversations["u" + state.conversant.id].messages.forEach((messageID) => {
        let message = messages[messageID];
        if (message.payload.type === "FILE") {
          let type = message.payload.fileType;

          // checks for and does not allow duplicates
          // not clear when this happens
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

  /* HANDLERS */
  /*
    changes which slide is displayed
    when clicking on a segment
  */
  const handleOnSegmentChange = (value: any) => {
    let index;
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
        index = 0;
    }
    slideRef.current?.slideTo(index);
  };

  /*
    changes which segment is highlighted
    when the slide is changed
  */
  const handleSlideChange = () => {
    const segmentValues = ["Info", "Media", "Files"]
    slideRef.current?.getActiveIndex()
      .then((currentIndex) => setCurrentSegment(segmentValues[currentIndex]));
  }

  /* 
    downloads a file when already in redux state
    if not, dispatches an action to get the file from hc
    when clicking the file download button
  */
  const onDownloadHandler = (file: FilePayload) => {
    console.log("Chat onDownloadHandler", file)
    fetchedFiles["u" + file.fileHash] !== undefined
    ? downloadFile(fetchedFiles["u" + file.fileHash], file.fileName)
    : dispatch(getFileBytes([base64ToUint8Array(file.fileHash)]))
      .then((res: {[key:string]: Uint8Array}) => downloadFile(res["u" + file.fileHash], file.fileName))
  }
  const downloadFile = (fileBytes: Uint8Array, fileName: string) => {
    const blob = new Blob([fileBytes]); // change resultByte to bytes  
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  // slider options
  const slideOpts = {
    initialSlide: 0,
    speed: 100,
  };

  return (
    <IonPage>

      <IonHeader>
        <ContactHeader username={state.conversant.username} />
        <SegmentTabs 
          value={currentSegment}
          onSegmentChange={handleOnSegmentChange} />
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
          <IonSlide></IonSlide>

          {/* Media */}
          <FileBox
            type={"media"}
            conversant={state.conversant}
            orderedFiles={orderedMedia}
            onDownload={file => onDownloadHandler(file)}
          />

          {/* Files */}
          <FileBox
            type={"files"}
            conversant={state.conversant}
            orderedFiles={orderedFiles}
            onDownload={file => onDownloadHandler(file)}
          />

        </IonSlides>
      </IonContent>
    </IonPage>
  );
};

export default ChatDetails;
