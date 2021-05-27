import { AgentPubKey } from "@holochain/conductor-api";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { IonIcon, IonItem, IonItemGroup, IonLabel, IonLoading } from "@ionic/react";
import { peopleOutline, personAddOutline, removeCircleOutline } from "ionicons/icons";

// Redux
import { Profile } from "../../../../../redux/profile/types";
import { useSelector } from "react-redux";
import { fetchId } from "../../../../../redux/profile/actions";
import { RootState } from "../../../../../redux/types";
import { GroupConversation } from "../../../../../redux/group/types";
import { removeGroupMembers } from "../../../../../redux/group/actions/removeGroupMembers";

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

  /* Local state */
  const [myAgentId, setMyAgentId] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [members, setMembers] = useState<Profile[]>([]);
  const [errMsg, setErrMsg] = useState<string>("");

  /* Selectors */
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const groupMembers = useSelector((state: RootState) => state.groups.members);
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[groupId]
  );

  /* Handlers */
  const handleRemoveMembers = (memberProfile: Profile) => {
    setLoading(true);
    /* err if member is being removed when total member <= 2 */
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

    // We include the creator in the membersProfile here
    members.forEach((member: string) => {
      if (groupMembers[member]) membersProfile.push(groupMembers[member]);
    });

    setMembers(membersProfile);
    setLoading(false);
  }, [groupData, groupMembers]);

  /* Renderer */
  const renderNoOfMembers = () => (
    <IonItem lines="none">
      <IonIcon className={styles.icon} icon={peopleOutline}></IonIcon>
      <IonLabel>
      {intl.formatMessage({id: "app.group-chat.members"}, {length: members.length})}
      </IonLabel>
    </IonItem>
  );

  const renderAddMemberButton = (groupData: GroupConversation) => {
    return (myAgentId === groupData.creator) ? (
      <IonItem lines="none" button onClick={() => setIsOpen(true)}>
        <IonIcon className={styles.icon} icon={personAddOutline}></IonIcon>
        <IonLabel>{intl.formatMessage({id: "app.group-chat.add-members"})}</IonLabel>
      </IonItem>
    ) : null
  };

  /* This is a version of remove member that is a button */
  const renderRemoveMemberButton = (member: Profile) => {
    /*
      - check that the agent is a creator 
      - check also that the remove button will not appear to self
    */
    return (myAgentId === groupData.creator && member.id !== groupData.creator) ? (
      <IonItem lines="none" slot="end"  button onClick={() => handleRemoveMembers(member)}>
        <IonIcon color="danger" icon={removeCircleOutline}/>
      </IonItem>
    ) : null
  };

  /* This is a version of remove member that is a slide (currently unused) */
  // const renderRemoveMemberSlide = (member: Profile) => {
  //   return (myAgentId === groupData.creator && member.id !== groupData.creator) ? (
  //     <IonItemOptions side={"end"}>
  //       <IonItemOption onClick={() => handleRemoveMembers(member)} color="danger">
  //         {intl.formatMessage({id: "app.group-chat.remove-member"})}
  //       </IonItemOption>
  //     </IonItemOptions>
  //   ) : null
  // }

  /*
    Currently, we are rending a button for remove member feature
    TODO: Discuss and decide whether we will use button or slide for remove member
    What would be nice is for us to use button for browser and slide for mobile app maybe.
  */
  const renderGroupMembers = (members: Profile[]) => members.map((member: Profile) => {
    let isCreator = member.id === groupData.creator;
    /* 
      Uncomment IonItemSliding and renderRemoveMemberSlide(member) and comment out 
      renderRemoveMemberButton(member) to change to slide
    */
    return (
      // <IonItemSliding>
      <IonItem lines="none" key={member.id}>
        <IonLabel className={styles["member-name"]}>
          {member.username}
          {/* TOOD: remove this <br /> and find a less uglier way of breaking line */}
          <br/>
          {isCreator ? intl.formatMessage({id: "app.group-chat.admin-role"}) : intl.formatMessage({id: "app.group-chat.member-role"})}
        </IonLabel>
        {renderRemoveMemberButton(member)}
        {/* {renderRemoveMemberSlide(member)} */}
      </IonItem>
      // </IonItemSliding>
    );
  });

  return !loading ? (
    <>
      <IonItemGroup className={styles["member-page"]}>
        {renderNoOfMembers()}
        {renderAddMemberButton(groupData)}

        <IonItem lines="none" className={styles["member-title"]}>
          <h3>{intl.formatMessage({id: "app.group-chat.members-label"})}</h3>
        </IonItem>

        {renderGroupMembers(members)}
      </IonItemGroup>

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
