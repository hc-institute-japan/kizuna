import { AgentPubKey } from "@holochain/conductor-api";
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
import { useHistory, useParams } from "react-router";
// Redux
import { updateGroupName } from "../../../redux/group/actions/updateGroupName";
import { getLatestGroupVersion } from "../../../redux/group/actions/getLatestGroupVersion";
import { GroupConversation } from "../../../redux/group/types";
import { getAgentId } from "../../../redux/profile/actions";
import { useAppDispatch } from "../../../utils/helpers";
import EndButtons from "./EndButtons";
// Components
import SegmentTabs from "./SegmentTabs";
import styles from "./style.module.css";
import File from "./TabsContent/Files/File";
import Media from "./TabsContent/Media/Media";
import Members from "./TabsContent/Members";
import UpdateGroupName from "./UpdateGroupName";
import { serializeHash } from "@holochain-open-dev/core-types";

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

  /* Local state */
  const [editGroupName, setEditGroupName] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [groupInfo, setGroupInfo] = useState<GroupConversation | undefined>();
  const [currentSegment, setCurrentSegment] = useState<string>("Info");

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
    setModalLoading(true);
    dispatch(
      updateGroupName({
        name: newGroupName,
        groupId: groupInfo!.originalGroupEntryHash,
        groupRevisionId: groupInfo!.originalGroupHeaderHash,
      })
    ).then((res: any) => {
      setModalLoading(false);
      setShowModal(false);
    });
  };

  /*
    This is to make sure that the latest state of the Group is being fetched.
  */
  useEffect(() => {
    dispatch(getLatestGroupVersion(group)).then(
      (groupRes: GroupConversation) => {
        setGroupInfo(groupRes);
        dispatch(getAgentId()).then((myAgentId: AgentPubKey | null) => {
          if (groupRes.creator !== serializeHash(myAgentId!)) setDisabled(true); // disable group name edit button if agent is not the creator
          setLoading(false);
        });
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return !loading && groupInfo ? (
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
            disabled={disabled}
          />
        </IonToolbar>

        <IonTitle className={styles.groupname}>{groupInfo!.name}</IonTitle>

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
              groupRevisionId={groupInfo!.originalGroupHeaderHash}
            />
          </IonSlide>

          <IonSlide>
            <Media groupId={group} />
          </IonSlide>

          <IonSlide>
            <File groupId={group} />
          </IonSlide>
        </IonSlides>
      </IonContent>

      <IonModal isOpen={showModal} cssClass="my-custom-modal-css">
        <UpdateGroupName
          loading={modalLoading}
          isOpen={showModal}
          onCancel={() => setShowModal(false)}
          groupData={groupInfo!}
          onSave={(newGroupName) => handleOnSave(newGroupName)}
        />
      </IonModal>
    </IonPage>
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default GroupChatInfo;
