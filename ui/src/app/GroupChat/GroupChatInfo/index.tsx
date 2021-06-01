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
// Redux
import { updateGroupName } from "../../../redux/group/actions/updateGroupName";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";
import EndButtons from "./EndButtons";
import { FilePayload } from "../../../redux/commons/types";
// Components
import SegmentTabs from "./SegmentTabs";
import styles from "./style.module.css";
import File from "./TabsContent/Files/File";
import Media from "./TabsContent/Media/Media";
import Members from "./TabsContent/Members";
import UpdateGroupName from "./UpdateGroupName";

import MediaBox from "../../../components/Slides/MediaBox";
import FileBox from "../../../components/Slides/FileBox";
import { GroupMessage } from "../../../redux/group/types";
import { getNextBatchGroupMessages } from "../../../redux/group/actions/getNextBatchGroupMessages";
import { fetchFilesBytes } from "../../../redux/group/actions/setFilesBytes";

interface GroupChatParams {
  group: string;
}

const GroupChatInfo: React.FC = () => {
  const history = useHistory();
  const { group } = useParams<GroupChatParams>();
  const dispatch = useAppDispatch();

  const slideOpts = {
    initialSlide: 0,
    speed: 100,
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
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentSegment, setCurrentSegment] = useState<string>("Info");

  const [media] = useState<{ [key: string]: boolean }>({});
  const [files] = useState<{ [key: string]: boolean }>({});
  const [orderedMedia] = useState<GroupMessage[]>([]);
  const [orderedFiles] = useState<GroupMessage[]>([]);

  /* Refs */
  const slideRef = useRef<HTMLIonSlidesElement>(null);

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
    setModalLoading(true);
    dispatch(
      updateGroupName({
        name: newGroupName,
        groupId: groupData!.originalGroupId,
        groupRevisionId: groupData!.originalGroupRevisionId,
      })
    ).then((res: any) => {
      setModalLoading(false);
      setShowModal(false);
    });
  };

  const handleOnDownload = (file: FilePayload) => {
    console.log("Chat onDownloadHandler", file);
    others[file.fileHash] !== undefined
      ? downloadFile(others[file.fileHash], file.fileName)
      : dispatch(fetchFilesBytes([file.fileHash])).then(
          (res: { [key: string]: Uint8Array }) =>
            downloadFile(res[file.fileHash], file.fileName)
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
    earliestMediaOrFile: any
  ) => {
    let earliest: GroupMessage = earliestMediaOrFile;

    dispatch(
      getNextBatchGroupMessages({
        groupId: group,
        lastFetched: earliest.groupMessageId,
        lastMessageTimestamp: earliest.timestamp,
        batchSize: 5,
        payloadType: {
          type: earliest.payload.type,
          payload: null,
        },
      })
    ).then((res: any) => complete());

    return;
  };

  return groupData ? (
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
                handleOnScrollBottom(complete, earliestMedia)
              }
            />
          </IonSlide>

          <IonSlide>
            {/* <File groupId={group} /> */}
            <FileBox
              orderedFileMessages={orderedFiles}
              onDownload={(file: FilePayload) => handleOnDownload(file)}
              onScrollBottom={(complete, earliestFile) =>
                handleOnScrollBottom(complete, earliestFile)
              }
            />
          </IonSlide>
        </IonSlides>
      </IonContent>

      <IonModal isOpen={showModal} cssClass="my-custom-modal-css">
        <UpdateGroupName
          loading={modalLoading}
          isOpen={showModal}
          onCancel={() => setShowModal(false)}
          groupData={groupData!}
          onSave={(newGroupName) => handleOnSave(newGroupName)}
        />
      </IonModal>
    </IonPage>
  ) : (
    <IonLoading isOpen={true} />
  );
};

export default GroupChatInfo;
