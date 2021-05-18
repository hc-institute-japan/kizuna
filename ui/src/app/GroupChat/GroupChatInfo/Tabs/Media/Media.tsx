import { IonContent, IonGrid, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonLoading, IonRow, IonText } from "@ionic/react";
import React, {useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  FilePayload,
  isTextPayload,
  Payload,
} from "../../../../../redux/commons/types";
import { getNextBatchGroupMessages } from "../../../../../redux/group/actions";
import {
  GroupMessageBatchFetchFilter,
  GroupMessagesOutput,
  GroupMessage,
} from "../../../../../redux/group/types";
import {
  base64ToUint8Array,
  monthToString,
  useAppDispatch,
} from "../../../../../utils/helpers";
import MediaIndex from "./MediaIndex";
import styles from "../../style.module.css";
import { sadOutline } from "ionicons/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/types";

interface Props {
  groupId: string;
}

const Media: React.FC<Props> = ({ groupId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const infiniteFileScroll = useRef<HTMLIonInfiniteScrollElement>(null);


  const [loading, setLoading] = useState<boolean>(true);
  const [oldestFetched, setOldestFetched] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [indexedFileMessages, setIndexedFileMessages] = useState<{
    [key: string]: GroupMessage[];
  }>({});
  const [fileMessages, setFileMessages] = useState<GroupMessage[]>([]);

  // USE SELECTORS
  const groupMediaMessages: GroupMessage[] = useSelector((state: RootState) => {
    // eslint-disable-next-line array-callback-return
    let groupMessages = state.groups.conversations[groupId].messages.map((key: string) => {
      let messageContent: GroupMessage = state.groups.messages[key];
      let payload: FilePayload | null = isTextPayload(messageContent.payload) ? null : (messageContent.payload.fileType === "IMAGE" || messageContent.payload.fileType === "VIDEO") ? messageContent.payload : null;
      if (payload) {
        return messageContent;
      }
    }).flatMap(
      (x: GroupMessage | undefined) => (x ? [x] : [])
    );
    return groupMessages
  });



  const complete = () => infiniteFileScroll.current!.complete();

  const indexMedia: (
    fileMessages: GroupMessage[]
  ) => {
    [key: string]: GroupMessage[];
  } = (fileMessages) => {
    let filteredMessages = fileMessages.filter((message) => {
      const payload: Payload = message.payload;
      return !isTextPayload(payload) && payload.fileType !== "OTHER";
    });
    let indexedFiles: {
      [key: string]: GroupMessage[];
    } = indexedFileMessages;
    if (filteredMessages.length > 0) {
      let monthNumber = new Date(
        fileMessages[0].timestamp[0] * 1000
      ).getMonth();
      let month = monthToString(monthNumber, intl)!;
      if (!indexedFiles[month]) {
        indexedFiles[month] = [];
      }
      fileMessages.forEach((fileMessage: GroupMessage) => {
        const currMonth = monthToString(
          new Date(fileMessage.timestamp[0] * 1000).getMonth(),
          intl
        );
        if (currMonth !== month) {
          month = currMonth!;
          indexedFiles[month] = [];
        }
        const currArr = indexedFiles[currMonth!];
        const payload: Payload = fileMessage.payload;
        if (
          !isTextPayload(payload) &&
          (payload.fileType === "IMAGE" || payload.fileType === "VIDEO")
        ) {
          currArr.push(fileMessage);
        }
      });
    }
    Object.keys(indexedFiles).forEach((month: string) => {
      let uniqueMessages: GroupMessage[] = [...new Set(indexedFiles[month])];
      indexedFiles[month] = uniqueMessages
    })
    return indexedFiles;
  };

  const onScrollBottom = (
    complete: () => Promise<void>,
    files: GroupMessage[]
  ) => {
    setFetchLoading(true);
    let lastFile: GroupMessage = files[files.length - 1];
    dispatch(
      getNextBatchGroupMessages({
        groupId: base64ToUint8Array(groupId),
        batchSize: 4,
        payloadType: { type: "MEDIA", payload: null },
        lastMessageTimestamp: lastFile !== undefined ? lastFile.timestamp : undefined,
        lastFetched: lastFile !== undefined ? Buffer.from(base64ToUint8Array(lastFile.groupMessageEntryHash)) : undefined
      })
    ).then((res: GroupMessagesOutput) => {
      if (Object.keys(res.groupMessagesContents).length !== 0) {
        let newFiles = Object.keys(res.groupMessagesContents).map((key: string) => {
          let message: GroupMessage = res.groupMessagesContents[key];
          return message
        });
        setFileMessages([...fileMessages, ...newFiles])
        const indexedMedia: {
          [key: string]: GroupMessage[];
        } = indexMedia(newFiles);
        setIndexedFileMessages(indexedMedia);
        setFetchLoading(false)
      } else {
        setOldestFetched(true);
        setFetchLoading(false);
      }
    });
    complete();
    return;
  };

  useEffect(() => {
    setLoading(true)
    if (groupMediaMessages.length >= 10) {
      setFileMessages([...fileMessages, ...groupMediaMessages]);
      const indexedMedia: {
        [key: string]: GroupMessage[];
      } = indexMedia(groupMediaMessages);
      setIndexedFileMessages(indexedMedia);
      setLoading(false);
    } else {
      let filter: GroupMessageBatchFetchFilter = {
        groupId: base64ToUint8Array(groupId),
        batchSize: 20,
        payloadType: { type: "MEDIA", payload: null },
      };
      dispatch(getNextBatchGroupMessages(filter)).then(
        (res: GroupMessagesOutput) => {
          let maybeFileMessages: (GroupMessage | undefined)[] = Object.keys(
            res.groupMessagesContents
          ).map((key: any) => {
            if (!isTextPayload(res.groupMessagesContents[key].payload)) {
              let message = res.groupMessagesContents[key];
              return message;
            } else {
              return undefined;
            }
          });
  
          let fileMessagesCleaned = maybeFileMessages.flatMap(
            (x: GroupMessage | undefined) => (x ? [x] : [])
          );
  
          setFileMessages([...fileMessages, ...fileMessagesCleaned])
  
          const indexedMedia: {
            [key: string]: GroupMessage[];
          } = indexMedia(fileMessagesCleaned);
          setIndexedFileMessages(indexedMedia);
          setLoading(false);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return !loading ? (
    Object.keys(indexedFileMessages).length !== 0 ? (
      <IonContent>
        <IonGrid>
          <IonRow>
            {Object.keys(indexedFileMessages).map((month: string) => {
              const fileMessages = indexedFileMessages[month];
              let files: FilePayload[] = [];
              fileMessages.forEach((fileMessage: GroupMessage) => {
                if (!isTextPayload(fileMessage.payload)) {
                  files.push(fileMessage.payload);
                }
              });

              return (
                <MediaIndex
                  onCompletion={() => {
                    return true;
                  }}
                  key={month}
                  index={month}
                  fileMessages={fileMessages}
                  files={files}
                />
              );
            })}
          </IonRow>
          <IonRow>
            <IonInfiniteScroll
              disabled= {oldestFetched ? true: false}
              threshold="10px"
              ref={infiniteFileScroll}
              position="bottom"
              onIonInfinite={(e) => onScrollBottom(complete, fileMessages)}
            >
              <IonInfiniteScrollContent>
                <IonLoading isOpen={fetchLoading} message={intl.formatMessage({id: "app.group-chat.media.fetching"})}/>
              </IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </IonRow>
        </IonGrid>
      </IonContent>
    ) : (
      <div className={styles["empty-media"]}>
        <IonIcon icon={sadOutline} size={"large"} />
        <IonLabel className={styles["no-media-label"]}>
            {intl.formatMessage({
              id: "app.group-chat.media.no-media",
            })}
        </IonLabel>
      </div>
    )
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default Media;
