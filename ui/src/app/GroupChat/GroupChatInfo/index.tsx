import { AgentPubKey } from "@holochain/conductor-api";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonLoading,
  IonModal,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSlide,
  IonSlides,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";

// Redux
import {
  getLatestGroupVersion,
  updateGroupName,
} from "../../../redux/group/actions";
import { GroupConversation } from "../../../redux/group/types";
import { fetchId } from "../../../redux/profile/actions";
import { RootState } from "../../../redux/types";
import { Uint8ArrayToBase64, useAppDispatch } from "../../../utils/helpers";

// Components
import SegmentTabs from "./SegmentTabs";
import EndButtons from "./EndButtons";
import File from "./Tabs/Files/File";
import Media from "./Tabs/Media/Media";
import Members from "./Tabs/Members/Members";
import UpdateGroupName from "./UpdateGroupName";

import styles from "./style.module.css";

interface GroupChatParams {
  group: string;
}

const GroupChatInfo: React.FC = () => {
  const history = useHistory();
  const intl = useIntl();
  const { group } = useParams<GroupChatParams>();
  const dispatch = useAppDispatch();

  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );

  /* Local state */
  const [myAgentId, setMyAgentId] = useState<string>("");
  const [editGroupName, setEditGroupName] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [groupInfo, setGroupInfo] = useState<GroupConversation | undefined>();
  const [selected, setSelected] = useState(0);

  const handleOnBack = () => {
    history.goBack();
  };

  const handleOnClickEdit = () => {
    setEditGroupName(editGroupName ? false : true);
    setShowModal(showModal ? false : true);
  };

  useEffect(() => {
    if (groupData) {
      dispatch(getLatestGroupVersion(group)).then(
        (groupRes: GroupConversation) => {
          setGroupInfo(groupRes);
          dispatch(fetchId()).then((res: AgentPubKey | null) => {
            if (res) setMyAgentId(Uint8ArrayToBase64(res));
            if (groupRes.creator !== Uint8ArrayToBase64(res!)) {
              // console.log((groupRes!.creator))
              // console.log((groupRes!.creator !== myAgentId))
              // console.log(myAgentId)

              setDisabled(true);
            }
            // console.log(disabled);
          });
        }
      );
      setLoading(false);
    } else {
      dispatch(getLatestGroupVersion(group)).then(
        (groupRes: GroupConversation) => {
          setGroupInfo(groupRes);
          dispatch(fetchId()).then((res: AgentPubKey | null) => {
            if (res) setMyAgentId(Uint8ArrayToBase64(res));
            if (groupRes.creator !== Uint8ArrayToBase64(res!)) {
              console.log(groupRes!.creator);
              console.log(myAgentId);
              setDisabled(true);
              setLoading(false);
            }
          });
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slideRef = useRef<HTMLIonSlidesElement>(null);
  const handleOnSegmentChange = (value: string) => {
    var index;
    switch (value) {
      case "info":
        index = 0;
        break;
      case "media":
        index = 1;
        break;
      case "files":
        index = 2;
        break;
      default:
        index = 0;
    }
    slideRef.current?.slideTo(index);
  };

  const slideOpts = {
    initialSlide: 0,
    speed: 400,
  };

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

        <SegmentTabs onSegmentChange={handleOnSegmentChange}/>
      </IonHeader>

      <IonContent>
        <IonSlides
          ref={slideRef}
          className="slides"
          pager={false}
          options={slideOpts}
        >
          <IonSlide>
            {groupInfo ? (
              <Members groupId={group} groupRevisionId={groupInfo!.originalGroupHeaderHash}/>
            ) : null}
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
          onSave={(newName) => {
            setModalLoading(true);
            dispatch(
              updateGroupName({
                name: newName,
                groupId: groupInfo!.originalGroupEntryHash,
                groupRevisionId: groupInfo!.originalGroupHeaderHash,
              })
            ).then((res: any) => {
              setModalLoading(false);
              setShowModal(false);
            });
          }}
        />
      </IonModal>
    </IonPage>
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default GroupChatInfo;
