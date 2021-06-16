import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLoading,
  IonModal,
  IonPage,
  IonSlide,
  IonSlides,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import FileBox from "../../../components/Slides/FileBox";
import MediaBox from "../../../components/Slides/MediaBox";
import { FetchPayloadType, FilePayload } from "../../../redux/commons/types";
import { getNextBatchGroupMessages } from "../../../redux/group/actions/getNextBatchGroupMessages";
import { fetchFilesBytes } from "../../../redux/group/actions/setFilesBytes";
// Redux
import { updateGroupName } from "../../../redux/group/actions/updateGroupName";
import { GroupMessage } from "../../../redux/group/types";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";
import EndButtons from "./EndButtons";
// Components
import SegmentTabs from "./SegmentTabs";
import styles from "./style.module.css";
import Members from "./Members";
import UpdateGroupName from "./UpdateGroupName";

interface GroupChatParams {
  group: string;
}

const GroupChatDetails: React.FC = () => {
  const history = useHistory();
  const { group } = useParams<GroupChatParams>();
  const dispatch = useAppDispatch();

  const slideOpts = {
    initialSlide: 0,
    speed: 400,
  };

  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );
  const myProfile = useSelector((state: RootState) => state.profile);
  const { conversations, messages } = useSelector(
    (state: RootState) => state.groups
  );
  const others = useSelector((state: RootState) => state.groups.groupFiles);

  /* Local state */
  const [editGroupName, setEditGroupName] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [media] = useState<{ [key: string]: boolean }>({});
  const [files] = useState<{ [key: string]: boolean }>({});
  const [orderedMedia] = useState<GroupMessage[]>([]);
  const [orderedFiles] = useState<GroupMessage[]>([]);
  const [currentSegment, setCurrentSegment] = useState<string>("Info");
  const [name, setName] = useState<string>("");

  /* Refs */
  const slideRef = useRef<HTMLIonSlidesElement>(null);

  /* Handlers */
  const handleOnBack = () => {
    history.goBack();
  };

  const handleOnClickEdit = () => {
    setEditGroupName(editGroupName ? false : true);
    setShowModal(showModal ? false : true);
  };

  /*
    changes which slide is displayed
    when clicking on a segment
  */
  const handleOnSegmentChange = (value: string) => {
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
    Handler for update of GroupName
  */
  const handleOnSave = (newGroupName: string) => {
    dispatch(
      updateGroupName({
        name: newGroupName,
        groupId: groupData!.originalGroupId,
        groupRevisionId: groupData!.originalGroupRevisionId,
      })
    ).then((res: any) => {
      if (res) {
        setName("");
        setShowModal(false);
      }
    });
  };

  const handleOnDownload = (file: FilePayload) => {
    others[file.fileHash] !== undefined
      ? downloadFile(others[file.fileHash], file.fileName)
      : dispatch(fetchFilesBytes([file.fileHash])).then(
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

  const handleOnScrollBottom = (
    complete: () => Promise<void>,
    earliestMediaOrFile: any,
    type: FetchPayloadType
  ) => {
    let earliest: GroupMessage = earliestMediaOrFile;

    if (earliest !== undefined) {
      dispatch(
        getNextBatchGroupMessages({
          groupId: group,
          lastFetched: earliest.groupMessageId,
          lastMessageTimestamp: earliest.timestamp,
          batchSize: 5,
          payloadType: type,
        })
      ).then((res: any) => {
        complete();
      });
    }
    return;
  };

  /* UseEffects */
  // sort others
  useEffect(() => {
    if (conversations[group] !== undefined) {
      conversations[group].messages.forEach((messageID) => {
        let message = messages[messageID];
        if (message.payload.type === "FILE") {
          let type = message.payload.fileType;

          // checks for and does not allow duplicates
          // not clear when this happens
          switch (type) {
            case "IMAGE":
              if (!media[message.groupMessageId]) {
                media[message.groupMessageId] = true;
                orderedMedia.push(message);
              }
              break;
            case "VIDEO":
              if (!media[message.groupMessageId]) {
                media[message.groupMessageId] = true;
                orderedMedia.push(message);
              }
              break;
            case "OTHER":
              if (!files[message.groupMessageId]) {
                files[message.groupMessageId] = true;
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

  /* fetch 40 media */
  useEffect(() => {
    dispatch(
      getNextBatchGroupMessages({
        groupId: group,
        batchSize: 40,
        payloadType: {
          type: "MEDIA",
          payload: null,
        },
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* fetch 40 Files */
  useEffect(() => {
    dispatch(
      getNextBatchGroupMessages({
        groupId: group,
        batchSize: 40,
        payloadType: {
          type: "FILE",
          payload: null,
        },
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {groupData ? (
        <IonPage>
          <IonHeader className={styles.header}>
            <IonToolbar>
              <IonButtons>
                <IonButton
                  onClick={() => handleOnBack()}
                  className="ion-no-padding"
                >
                  <IonIcon slot="icon-only" icon={arrowBackSharp} />
                </IonButton>
              </IonButtons>
              <EndButtons
                onClickEdit={() => handleOnClickEdit()}
                onClickNotif={() => {}}
                disabled={groupData.creator !== myProfile.id ? true : false}
              />
            </IonToolbar>

            <IonTitle className={styles.groupname}>{groupData!.name}</IonTitle>

            <SegmentTabs
              value={currentSegment}
              onSegmentChange={handleOnSegmentChange}
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
              <IonSlide>
                <Members
                  groupId={group}
                  groupRevisionId={groupData!.originalGroupRevisionId}
                />
              </IonSlide>

              <IonSlide>
                {/* <Media groupId={group} /> */}
                <MediaBox
                  orderedMediaMessages={orderedMedia}
                  onDownload={(file: FilePayload) => handleOnDownload(file)}
                  onScrollBottom={(complete, earliestMedia) =>
                    handleOnScrollBottom(complete, earliestMedia, {
                      type: "MEDIA",
                      payload: null,
                    })
                  }
                />
              </IonSlide>

              <IonSlide>
                {/* <File groupId={group} /> */}
                <FileBox
                  orderedFileMessages={orderedFiles}
                  onDownload={(file: FilePayload) => handleOnDownload(file)}
                  onScrollBottom={(complete, earliestFile) =>
                    handleOnScrollBottom(complete, earliestFile, {
                      type: "FILE",
                      payload: null,
                    })
                  }
                />
              </IonSlide>
            </IonSlides>
          </IonContent>

          <IonModal isOpen={showModal} cssClass="my-custom-modal-css">
            <UpdateGroupName
              setName={setName}
              name={name}
              onCancel={() => setShowModal(false)}
              onSave={(newGroupName) => handleOnSave(newGroupName)}
            />
          </IonModal>
        </IonPage>
      ) : (
        <IonLoading isOpen={true} />
      )}
    </>
  );
};

export default GroupChatDetails;
