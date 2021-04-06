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

interface Props {
  groupId: string;
  groupRevisionId: string;
}

const Members: React.FC<Props> = ({ groupId, groupRevisionId }) => {
  const dispatch = useAppDispatch();
  const [myAgentId, setMyAgentId] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [members, setMembers] = useState<Profile[]>([]);
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const groupMembers = useSelector((state: RootState) => state.groups.members);
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[groupId]
  );
  const { username } = useSelector((state: RootState) => state.profile);

  const handleRemoveMembers = (memberProfile: Profile) => {
    setLoading(true);
    if (groupData.members.length <= 3) {
      setLoading(false);
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
    let members: Profile[] = [];
    groupData.members.forEach((member: string) => {
      members.push(groupMembers[member]);
    });
    setMembers(members);
    setLoading(false);
  }, [groupData, groupMembers]);

  return !loading ? (
    <IonContent>
      <IonList className={styles.memberInfo}>
        <IonItem lines="none" key={"member-numbers"}>
          <IonIcon className={styles.icon} icon={peopleOutline}></IonIcon>
          <IonLabel>{members.length + 1 + " members"}</IonLabel>
        </IonItem>

        <IonItem
          lines="none"
          button
          onClick={() => setIsOpen(true)}
          key={"add-members-button"}
        >
          <IonIcon className={styles.icon} icon={personAddOutline}></IonIcon>
          <IonLabel>Add Members</IonLabel>
        </IonItem>

        <IonItem
          lines="none"
          className={styles.memberTitle}
          key={"members-label"}
        >
          <h3>Members</h3>
        </IonItem>

        {members.map((member: any) => {
          return member.id === groupData.creator ? (
            <React.Fragment key={member.id}>
              <IonItemSliding>
                <IonItem lines="none" key={member.id}>
                  <IonLabel className={styles.memberName} key={member.id}>
                    <h3>
                      {member.username}
                      <br />
                      admin
                    </h3>
                  </IonLabel>
                </IonItem>
              </IonItemSliding>
              <br />
            </React.Fragment>
          ) : (
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
          );
        })}
        {myAgentId === groupData.creator ? (
          <IonItemSliding>
            <IonItem lines="none" key={myAgentId}>
              <IonLabel className={styles.memberName}>
                <h3>
                  {username}
                  <br />
                  admin
                </h3>
              </IonLabel>
            </IonItem>
          </IonItemSliding>
        ) : (
          <IonItemSliding>
            <IonItem lines="none" key={myAgentId}>
              <IonLabel className={styles.memberName}>
                <h3>
                  {username}
                  <br />
                  member
                </h3>
              </IonLabel>
            </IonItem>
          </IonItemSliding>
        )}
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

      <RemoveMemberToast toast={toast} onDismiss={() => setToast(false)} />
    </IonContent>
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default Members;
