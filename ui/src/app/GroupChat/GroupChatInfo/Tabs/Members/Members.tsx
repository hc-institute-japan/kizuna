import { AgentPubKey } from "@holochain/conductor-api";
import {
  IonContent,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
} from "@ionic/react";
import { peopleOutline, personAddOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchId } from "../../../../../redux/profile/actions";
import { Profile } from "../../../../../redux/profile/types";
import { RootState } from "../../../../../redux/types";
import {
  Uint8ArrayToBase64,
  useAppDispatch,
} from "../../../../../utils/helpers";
import AddMemberModal from "./AddMemberModal";
import styles from "../../style.module.css";
import { removeGroupMembers } from "../../../../../redux/group/actions";
import RemoveMemberToast from "./RemoveMemberToast";
import { useIntl } from "react-intl";

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

  const handleRemoveMembers = (memberProfile: Profile) => {
    setLoading(true);

    // display error when non-admin members are trying to remove members
    if (myAgentId !== groupData.creator) {
      setLoading(false);
      setErrMsg(intl.formatMessage(
        { id: "app.groups.non-admin-cannot-remove" },
      ));
      setToast(true);
      return null
    }

    if (groupData.members.length <= 2) {
      setLoading(false);
      setErrMsg(intl.formatMessage(
        { id: "app.groups.minimum-member-required-reached" },
      ));
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

  useEffect(() => {
    dispatch(fetchId()).then((res: AgentPubKey | null) => {
      if (res) setMyAgentId(Uint8ArrayToBase64(res));
    });
  }, [dispatch]);

  useEffect(() => {
    let membersProfile: Profile[] = [];
    let members = [...groupData.members, groupData.creator];
    console.log("here are the groupMembers", groupMembers);

    // We have to account for creator and members here
    members.forEach((member: string) => {
      if (groupMembers[member]) membersProfile.push(groupMembers[member]);
    });

    console.log("here are the membersProfile", membersProfile);
    console.log("here are the members", members);

    setMembers(membersProfile);
    setLoading(false);
  }, [groupData, groupMembers]);

  return !loading ? (
    <IonContent>
      <IonList className={styles.memberInfo}>
        <IonItem lines="none" key={"member-numbers"}>
          <IonIcon className={styles.icon} icon={peopleOutline}></IonIcon>
          <IonLabel>{members.length + " members"}</IonLabel>
        </IonItem>

        {(myAgentId === groupData.creator) ? (<IonItem
          lines="none"
          button
          onClick={() => setIsOpen(true)}
          key={"add-members-button"}
        >
          <IonIcon className={styles.icon} icon={personAddOutline}></IonIcon>
          <IonLabel>Add Members</IonLabel>
        </IonItem>) : null}

        <IonItem
          lines="none"
          className={styles.memberTitle}
          key={"members-label"}
        >
          <h3>Members</h3>
        </IonItem>

        {/* This is for members and admin*/}
        {members.map((member: any) => {
          console.log(members)
          return member.id !== groupData.creator ? (
            <React.Fragment key={member.id}>
              <IonItemSliding>
                <IonItem lines="none" key={member.id}>
                  <IonLabel className={styles.memberName} key={member.id}>
                    <h3>
                      {member.username}
                      <br />
                      member
                    </h3>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side={"end"}>
                  <IonItemOption
                    onClick={() => handleRemoveMembers(member)}
                    color="danger"
                  >
                    REMOVE
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            </React.Fragment>
          ) : (
            <IonItemSliding>
              <IonItem lines="none" key={member.id}>
                <IonLabel className={styles.memberName}>
                  <h3>
                    {member.username}
                    <br />
                    admin
                  </h3>
                </IonLabel>
              </IonItem>
            </IonItemSliding>
          ) ;
        })}
      </IonList>

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
    </IonContent>
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default Members;
