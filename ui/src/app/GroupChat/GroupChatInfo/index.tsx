import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonLoading,
  IonModal,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  getLatestGroupVersion,
  updateGroupName,
} from "../../../redux/group/actions";
import { GroupConversation, GroupMessage } from "../../../redux/group/types";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";
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
  const { group } = useParams<GroupChatParams>();

  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );
  const allMessages = useSelector((state: RootState) => state.groups.messages);

  const [editGroupName, setEditGroupName] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [groupInfo, setGroupInfo] = useState<GroupConversation | undefined>();

  const [selected, setSelected] = useState(0);
  const messages: GroupMessage[] = groupInfo
    ? groupInfo?.messages.map((key: string) => {
        let message = allMessages[key];
        return message;
      })
    : [];
  const tabs = [
    {
      label: "Members",
      tab: groupInfo ? (
        <Members
          groupId={group}
          groupRevisionId={groupInfo!.originalGroupHeaderHash}
        />
      ) : null,
    },
    {
      label: "Media",
      tab: <Media fileMessages={messages} groupId={group} />,
    },
    {
      label: "Files",
      tab: <File fileMessages={messages} groupId={group} />,
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
      dispatch(getLatestGroupVersion(group)).then((res: GroupConversation) => {
        setGroupInfo(res);
      });
      setLoading(false);
    } else {
      dispatch(getLatestGroupVersion(group)).then((res: GroupConversation) => {
        setGroupInfo(res);
        setLoading(false);
      });
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
          />
        </IonToolbar>
        <IonTitle className={styles.groupname}>{groupInfo!.name}</IonTitle>
        <IonToolbar className={styles.menu}>
          <IonButtons slot="start">
            {tabs.map((tab, i) => {
              const isSelected = selected === i;
              return (
                <IonButton
                  key={tab.label}
                  strong={selected === i}
                  onClick={() => setSelected(i)}
                >
                  <IonText
                    {...(isSelected
                      ? { className: styles.selected, color: "primary" }
                      : {})}
                  >
                    {tab.label}
                  </IonText>
                </IonButton>
              );
            })}
          </IonButtons>
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
