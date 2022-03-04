import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
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
  IonText,
  IonTitle,
  IonToolbar,
  useIonModal,
} from "@ionic/react";
import {
  arrowBackSharp,
  imageOutline,
  peopleCircleOutline,
} from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import ImageCropper from "../../../components/ImageCropper";
import FileBox from "../../../components/Slides/FileBox";
import MediaBox from "../../../components/Slides/MediaBox";
import { FetchPayloadType, FilePayload } from "../../../redux/commons/types";
import {
  fetchFilesBytes,
  getPreviousGroupMessages,
  updateGroupAvatar,
  updateGroupName,
} from "../../../redux/group/actions";
import { GroupMessage } from "../../../redux/group/types";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/services/ReduxService";
import EndButtons from "./EndButtons";
import Members from "./Members";
// Components
import SegmentTabs from "./SegmentTabs";
import styles from "./style.module.css";
import UpdateGroupName from "./UpdateGroupName";

interface GroupChatParams {
  group: string;
}

const GroupChatDetails: React.FC = () => {
  const intl = useIntl();
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
    others[file.fileHash!] !== undefined
      ? downloadFile(others[file.fileHash!], file.fileName)
      : dispatch(fetchFilesBytes([file.fileHash!])).then(
          (res: { [key: string]: Uint8Array }) => {
            if (res && Object.keys(res).length > 0) {
              downloadFile(res[file.fileHash!], file.fileName);
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
        getPreviousGroupMessages({
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
      conversations[group].messages.forEach((messageID: string) => {
        let message = messages[messageID];
        if (message && message.payload.type === "FILE") {
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
      getPreviousGroupMessages({
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
      getPreviousGroupMessages({
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

  const file = useRef<HTMLInputElement>(null);
  const [binary, setBinary] = useState<null | Uint8Array>(null);
  const groupPicture = useRef<HTMLImageElement>(null);

  const decodeSrc = () => {
    const decoder = new TextDecoder();

    return binary ? decoder.decode(binary) : "";
  };

  const onDismiss = () => {
    setBinary(null);
    dismiss();
  };

  const [present, dismiss] = useIonModal(ImageCropper, {
    src: decodeSrc(),
    prevPath: "/register",
    dismiss: onDismiss,
    onComplete: (binary: Uint8Array) => {
      if (binary) {
        const blob = new Blob([binary], { type: "image/jpeg" });
        dispatch(
          updateGroupAvatar({
            avatar: serializeHash(binary),
            groupId: groupData!.originalGroupId,
            groupRevisionId: groupData!.originalGroupRevisionId,
          })
        );
        groupPicture.current!.src = URL.createObjectURL(blob);
        // setBinary(binary);
      }
    },
    intl,
  });

  const handleOnFileChange = () => {
    Array.from(file.current ? file.current.files! : new FileList()).forEach(
      (file) => {
        file.arrayBuffer().then((arrBuffer) => {
          const fileSize = file.size;
          // const fileName = file.name;
          // 15mb = 15728640b, file.size is of type bytes
          if (fileSize < 15728640) {
            const encoder = new TextEncoder();
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = (readerEvent) => {
              const encoded = encoder.encode(
                readerEvent.target?.result as string
              );

              setBinary(encoded);
            };
          }
        });
      }
    );
  };

  useEffect(() => {
    if (binary) present({ cssClass: `cropper ${styles.modal}` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binary]);

  const renderGroupAvatar = () => {
    if (groupData.creator === myProfile.id) {
      return (
        <div className={styles["avatar-container"]}>
          {/* <UpdateAvatar
                imageRef={groupPicture}
                onChange={() => {}}
              ></UpdateAvatar> */}
          <div className={styles["avatar-content"]}>
            <div className={styles["avatar"]}>
              <div className={styles["image-container"]}>
                {groupData.avatar ? (
                  <img
                    ref={groupPicture}
                    alt={groupData.name}
                    src={URL.createObjectURL(
                      new Blob([deserializeHash(groupData.avatar)], {
                        type: "image/jpeg",
                      })
                    )}
                  />
                ) : (
                  <img
                    ref={groupPicture}
                    alt={groupData.name}
                    src={peopleCircleOutline}
                    className={styles.img}
                  ></img>
                )}
              </div>
              <div
                onClick={() => file.current?.click()}
                className={styles.overlay}
              >
                <IonText className="ion-text-center">
                  {intl.formatMessage({
                    id: "app.group-chat.change-avatar",
                  })}
                </IonText>
              </div>
            </div>
            <div className={styles["icon-overlay"]}>
              <IonIcon size="large" icon={imageOutline}></IonIcon>
            </div>
          </div>
          <input
            ref={file}
            type="file"
            hidden
            accept="image/png, image/jpeg"
            onChange={handleOnFileChange}
          />
        </div>
      );
    } else {
      return (
        <div className={styles["avatar-container"]}>
          {/* <UpdateAvatar
                imageRef={groupPicture}
                onChange={() => {}}
              ></UpdateAvatar> */}
          <div className={styles["avatar-content"]}>
            <div className={styles["avatar"]}>
              <div className={styles["image-container"]}>
                {groupData.avatar ? (
                  <img
                    ref={groupPicture}
                    alt={groupData.name}
                    src={URL.createObjectURL(
                      new Blob([deserializeHash(groupData.avatar)], {
                        type: "image/jpeg",
                      })
                    )}
                  />
                ) : (
                  <img
                    ref={groupPicture}
                    alt={groupData.name}
                    src={peopleCircleOutline}
                    className={styles.img}
                  ></img>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

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
            {renderGroupAvatar()}
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
