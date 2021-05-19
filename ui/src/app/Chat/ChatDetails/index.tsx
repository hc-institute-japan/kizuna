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
import { P2PMessage } from "../../../redux/p2pmessages/types";
import { getNextBatchMessages } from "../../../redux/p2pmessages/actions";
import { useAppDispatch, base64ToUint8Array } from "../../../utils/helpers";
import styles from "./style.module.css";
import { useIntl } from "react-intl";

import ContactHeader from "./ContactHeader";
import SegmentTabs from "./SegmentTabs";
import FileBox from "./FileBox";

interface Props {
  location: RouteComponentProps<{}, {}, { conversant: Profile }>;
}

const ChatDetails: React.FC<Props> = ({ location }) => {
  /* STATES */
  const { state }: any = { ...location };
  const intl = useIntl();
  const { conversations, messages, receipts } = useSelector((state: RootState) => state.p2pmessages);
  const [ media, setMedia ] = useState< { [key: string]: boolean }>({});
  const [ files, setFiles ] = useState< { [key: string]: P2PMessage }>({});
  const [ orderedMedia, setOrderedMedia ] = useState<P2PMessage[]>([]);
  const [ orderedFiles, setOrderedFiles ] = useState<P2PMessage[]>([]);
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
  }, [conversations, messages]);

  /* HANDLERS */
  /*
    changes which slide is displayed
    when clicking on a segment
  */
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
        index = 0;
    }
    slideRef.current?.slideTo(index);
  };

  // slider options
  const slideOpts = {
    initialSlide: 0,
    speed: 400,
  };

  return (
    <IonPage>

      <IonHeader>
        <ContactHeader username={state.conversant.username} />
        <SegmentTabs onSegmentChange={handleOnSegmentChange} />
      </IonHeader>


      <IonContent>
        <IonSlides
          ref={slideRef}
          className="slides"
          pager={false}
          options={slideOpts}
        >
          
          {/* Contact Info */}
          {/* TODO: change to empty component for now */}
          <IonSlide></IonSlide>

          {/* Media */}
          <FileBox
            type={"media"}
            conversant={state.conversant}
            orderedFiles={orderedMedia}
          />

          {/* Files */}
          <FileBox
            type={"files"}
            conversant={state.conversant}
            orderedFiles={orderedFiles}
          />

        </IonSlides>
      </IonContent>
    </IonPage>
  );
};

export default ChatDetails;
