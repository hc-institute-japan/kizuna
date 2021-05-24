import { AgentPubKey } from "@holochain/conductor-api";
import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonIcon,
  IonItem,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
  IonSlide,
  IonText,
} from "@ionic/react";
import { useIntl } from "react-intl";
import { peopleOutline, personAddOutline } from "ionicons/icons";

// Redux
import { Profile } from "../../../../../redux/profile/types";
import { useSelector } from "react-redux";
import { fetchId } from "../../../../../redux/profile/actions";
import { RootState } from "../../../../../redux/types";
import { GroupConversation } from "../../../../../redux/group/types";
import { removeGroupMembers } from "../../../../../redux/group/actions";

// Components
import RemoveMemberToast from "./RemoveMemberToast";
import AddMemberModal from "./AddMemberModal";

import { Uint8ArrayToBase64, useAppDispatch } from "../../../../../utils/helpers";
import styles from "./style.module.css";

interface Props {
  groupId: string;
  groupRevisionId: string;
}

const Members: React.FC<Props> = ({ groupId, groupRevisionId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [myAgentId, setMyAgentId] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [members, setMembers] = useState<Profile[]>([]);
  const [errMsg, setErrMsg] = useState<string>("");
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const groupMembers = useSelector((state: RootState) => state.groups.members);
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[groupId]
  );



  /* Handlers */
  const handleRemoveMembers = (memberProfile: Profile) => {
    setLoading(true);

    // display error when non-admin members are trying to remove members
    if (myAgentId !== groupData.creator) {
      setLoading(false);
      setErrMsg(
        intl.formatMessage({ id: "app.group-chat.non-admin-cannot-remove" })
      );
      setToast(true);
      return null;
    }

    if (groupData.members.length <= 2) {
      setLoading(false);
      setErrMsg(
        intl.formatMessage({ id: "app.group-chat.minimum-member-required-reached" })
      );
      setToast(true);
      return null;
    }

    let input = {
      members: [memberProfile.id],
      groupId: groupData.originalGroupEntryHash,
      groupRevisionId: groupData.originalGroupHeaderHash,
    };
    dispatch(removeGroupMembers(input)).then((res: any) => {
      let newMembers = members.filter((x) => !res.members.includes(x.id));
      setMembers(newMembers);
      setLoading(false);
    });
  };

  /* Use Effects */
  useEffect(() => {
    dispatch(fetchId()).then((res: AgentPubKey | null) => {
      if (res) setMyAgentId(Uint8ArrayToBase64(res));
    });
  }, [dispatch]);

  useEffect(() => {
    let membersProfile: Profile[] = [];
    let members = [...groupData.members, groupData.creator];

    // We have to account for creator and members here
    members.forEach((member: string) => {
      if (groupMembers[member]) membersProfile.push(groupMembers[member]);
    });

    setMembers(membersProfile);
    setLoading(false);
  }, [groupData, groupMembers]);

  /* Renderer */
  const renderAddMemberButton = (groupData: GroupConversation) => {
    return (myAgentId === groupData.creator) ? (
      <IonItem lines="none" button onClick={() => setIsOpen(true)}>
        <IonIcon className={styles.icon} icon={personAddOutline}></IonIcon>
        <IonLabel>{intl.formatMessage({id: "app.group-chat.add-members"})}</IonLabel>
      </IonItem>
    ) : null
  }

  const renderGroupMembers = (members: Profile[]) => members.map((member: any) => member.id !== groupData.creator ? 
    (
      <IonItemSliding>
        <IonItem lines="none" key={member.id}>
          <IonLabel className={styles.memberName} key={member.id}>
            {member.username}
          </IonLabel>
          <IonText>
            {intl.formatMessage({id: "app.group-chat.member-role"})}
          </IonText>
        </IonItem>
        <IonItemOptions side={"end"}>
          <IonItemOption onClick={() => handleRemoveMembers(member)} color="danger">
            {intl.formatMessage({id: "app.group-chat.remove-member"})}
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    ) : (
      <IonItemSliding>
        <IonItem lines="none" key={member.id}>
          <IonLabel className={styles.memberName}>
            <h3>
              {member.username}
              <br />
              {intl.formatMessage({id: "app.group-chat.admin-role"})}
            </h3>
          </IonLabel>
        </IonItem>
      </IonItemSliding>
    )
  );

  return !loading ? (
    <>
      <IonItemGroup>
        <IonItem lines="none">
          <IonIcon className={styles.icon} icon={peopleOutline}></IonIcon>
          <IonLabel>
            {intl.formatMessage({id: "app.group-chat.members"}, {length: members.length})}
          </IonLabel>
        </IonItem>

        {renderAddMemberButton(groupData)}

        <IonItem lines="none" className={styles.memberTitle}>
          <h3>{intl.formatMessage({id: "app.group-chat.members-label"})}</h3>
        </IonItem>
      </IonItemGroup>

      <IonItemGroup>
        {renderGroupMembers(members)}
      </IonItemGroup>
        {/* This is for members and admin*/}

      <AddMemberModal
        contacts={contacts}
        members={members}
        setMembers={setMembers}
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        setIsOpen={setIsOpen}
        groupId={groupId}
        groupRevisionId={groupRevisionId}
        setLoading={setLoading}
        myAgentId={myAgentId}
      />
      <RemoveMemberToast toast={toast} onDismiss={() => setToast(false)} message={errMsg}/>
    </>
  ) : <IonLoading isOpen={loading} />
};

export default Members;
