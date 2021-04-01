import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonLabel,
  IonLoading,
  IonModal,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState, } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  getLatestGroupVersion,
  updateGroupName,
} from "../../../redux/group/actions";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";
import styles from "./style.module.css";
import { arrowBackSharp } from "ionicons/icons";
import EndButtons from "./EndButtons";
import UpdateGroupName from "./UpdateGroupName";
import Members from "./Tabs/Members/Members";
import Media from "./Tabs/Media/Media";
import { GroupConversation } from "../../../redux/group/types";

interface GroupChatParams {
  group: string;
}

const GroupChatInfo: React.FC = () => {
  const history = useHistory();
  const { group } = useParams<GroupChatParams>();
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );
  const [editGroupName, setEditGroupName] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false)
  const [groupInfo, setGroupInfo] = useState<GroupConversation | undefined>();
  const [show, setShow] = useState<{
    members: boolean;
    files: boolean;
    media: boolean;
  }>({
    members: true,
    files: false,
    media: false,
  });
  const dispatch = useAppDispatch();

  const handleOnBack = () => {
    history.goBack();
  };

  const handleOnClickEdit = () => {
      setEditGroupName(editGroupName ? false : true)
      setShowModal(showModal ? false : true)
  }

  const showTab = (show: {
    members: boolean;
    files: boolean;
    media: boolean;
  }) => {
    switch (true) {
      case (show.members): {
        // setMembers(groupData.members.length + " members");
        return (<Members groupId={group} groupRevisionId={groupInfo!.originalGroupHeaderHash}/>)
      }
      case (show.files): {
        return (
          <IonLabel>
            HERE ARE THE FILES!
          </IonLabel>
        )
      }
      case (show.media): {
        return (
          <Media groupId={group}/>
        )
      }
      default:
        break;
    }
  }

useEffect(() => {
  if (groupData) {
    dispatch(getLatestGroupVersion(group)).then((res:GroupConversation) => {
      setGroupInfo(res);
    })
    setLoading(false);
  } else {
    dispatch(getLatestGroupVersion(group)).then((res:GroupConversation) => {
      setGroupInfo(res);
      setLoading(false);
    })
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  return (!loading && groupInfo) ? (
    <IonPage>
        <IonHeader className={styles.header}>
          <IonToolbar >
            <IonButtons>
              <IonButton  onClick={() => handleOnBack()} className="ion-no-padding" >
                <IonIcon slot="icon-only" icon={arrowBackSharp} />  
              </IonButton>
            </IonButtons>
            <EndButtons onClickEdit={() => handleOnClickEdit()} onClickNotif={() => {}}/>
          </IonToolbar>
          <IonTitle className={styles.groupname}>{groupInfo!.name}</IonTitle>
          <IonToolbar className={styles.menu}>
            <IonButtons slot="start" >
              <IonButton strong={show.members} onClick={() => setShow({
                members: true,
                media: false,
                files: false,
              })}>
                {
                  show.members ? <IonText className={styles.selected} color={"primary"}>Members</IonText> : <IonText>Members</IonText>
                }
              </IonButton>
              <IonButton  strong={show.media} onClick={() => setShow({
                members: false,
                media: true,
                files: false,
              })}>              {
                show.media ? <IonText className={styles.selected} color={"primary"}>Media</IonText> : <IonText>Media</IonText>
              }</IonButton>
              <IonButton strong={show.files} onClick={() => setShow({
                members: false,
                media: false,
                files: true,
              })}>              {
                show.files ? <IonText className={styles.selected} color={"primary"}>Files</IonText> : <IonText>Files</IonText>
              }</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        {showTab(show)}

      
      <IonModal isOpen={showModal} cssClass="my-custom-modal-css">
        <UpdateGroupName loading={modalLoading} isOpen={showModal} onCancel={() => setShowModal(false)} groupData={groupInfo!} onSave={(newName) => {
          setModalLoading(true);
          dispatch(updateGroupName({
            name: newName,
            groupId: groupInfo!.originalGroupEntryHash,
            groupRevisionId: groupInfo!.originalGroupHeaderHash
          })).then((res: any) => {
            setModalLoading(false);
            setShowModal(false);
          })
        }}/>
      </IonModal>
    </IonPage>
  ) : <IonLoading isOpen={loading} />;
};

export default GroupChatInfo;