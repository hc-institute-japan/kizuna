import { AgentPubKey } from "@holochain/conductor-api";
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonLoading,
  IonModal,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  getLatestGroupVersion,
  updateGroupName,
} from "../../../redux/group/actions";
import { GroupConversation } from "../../../redux/group/types";
import { fetchId } from "../../../redux/profile/actions";
import { RootState } from "../../../redux/types";
import { Uint8ArrayToBase64, useAppDispatch } from "../../../utils/helpers";
import EndButtons from "./EndButtons";
import styles from "./style.module.css";
import File from "./Tabs/Files/File";
import Media from "./Tabs/Media/Media";
import Members from "./Tabs/Members/Members";
import UpdateGroupName from "./UpdateGroupName";

interface GroupChatParams {
  group: string;
}

const GroupChatInfo: React.FC = () => {
  const history = useHistory();
  const intl = useIntl();
  const { group } = useParams<GroupChatParams>();

  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );

  const [myAgentId, setMyAgentId] = useState<string>("");
  const [editGroupName, setEditGroupName] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [groupInfo, setGroupInfo] = useState<GroupConversation | undefined>();

  const [selected, setSelected] = useState(0);

  const tabs = [
    {
      label: intl.formatMessage({ id: "app.groups.label-info" }),
      tab: groupInfo ? (
        <Members
          groupId={group}
          groupRevisionId={groupInfo!.originalGroupHeaderHash}
        />
      ) : null,
    },
    {
      label: intl.formatMessage({ id: "app.groups.label-media" }),
      tab: <Media groupId={group} />,
    },
    {
      label: intl.formatMessage({ id: "app.groups.label-files" }),
      tab: <File groupId={group} />,
    },
  ];

  const dispatch = useAppDispatch();

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
        <IonToolbar className={styles.menu}>
          <IonSegment slot="start">
            {tabs.map((tab, i) => {
              const isSelected = selected === i;
              return (
                <IonSegmentButton
                  key={tab.label}
                  onClick={() => setSelected(i)}
                >
                  <IonText
                    {...(isSelected
                      ? { className: styles.selected, color: "primary" }
                      : {})}
                  >
                    {tab.label}
                  </IonText>
                </IonSegmentButton>
              );
            })}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      {tabs[selected].tab}

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
