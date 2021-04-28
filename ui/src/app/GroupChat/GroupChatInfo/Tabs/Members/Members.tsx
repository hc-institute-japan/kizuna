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
  IonSlide,
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
      setErrMsg(
        intl.formatMessage({ id: "app.groups.non-admin-cannot-remove" })
      );
      setToast(true);
      return null;
    }

    if (groupData.members.length <= 2) {
      setLoading(false);
      setErrMsg(
        intl.formatMessage({ id: "app.groups.minimum-member-required-reached" })
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

  return !loading ? (
    
      <IonContent>
          <IonItem lines="none" key={"member-numbers"}>
            <IonIcon className={styles.icon} icon={peopleOutline}></IonIcon>
            <IonLabel>{intl.formatMessage(
              {id: "app.groups.members"},
              {length: members.length},
            )}</IonLabel>
          </IonItem>
          {(myAgentId === groupData.creator) ? (<IonItem
            lines="none"
            button
            onClick={() => setIsOpen(true)}
            key={"add-members-button"}
          >
            <IonIcon className={styles.icon} icon={personAddOutline}></IonIcon>
            <IonLabel>{intl.formatMessage({id: "app.groups.add-members"})}</IonLabel>
          </IonItem>) : null}
          <IonItem
            lines="none"
            className={styles.memberTitle}
            >
            <h3>{intl.formatMessage({id: "app.groups.members-label"})}</h3>
          </IonItem>
            <IonList>
              {members.map((member: any) => {
                return member.id !== groupData.creator ? (
                  <IonItem>
                    <IonItemSliding>
                      <IonItem lines="none" key={member.id}>
                        <IonLabel className={styles.memberName} key={member.id}>
                          <h3>
                            {member.username}
                            <br />
                            {intl.formatMessage({id: "app.groups.member-role"})}
                          </h3>
                        </IonLabel>
                      </IonItem>
                      <IonItemOptions side={"end"}>
                        <IonItemOption
                          onClick={() => handleRemoveMembers(member)}
                          color="danger"
                        >
                          {intl.formatMessage({id: "app.groups.remove-member"})}
                        </IonItemOption>
                      </IonItemOptions>
                    </IonItemSliding>
                  </IonItem>
                ) : (
                  <IonItem>
                    <IonItemSliding>
                      <IonItem lines="none" key={member.id}>
                        <IonLabel className={styles.memberName}>
                          <h3>
                            {member.username}
                            <br />
                            {intl.formatMessage({id: "app.groups.admin-role"})}
                          </h3>
                        </IonLabel>
                      </IonItem>
                    </IonItemSliding>
                  </IonItem>
                ) ;
              })}
            </IonList>
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
      </IonContent>
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default Members;
