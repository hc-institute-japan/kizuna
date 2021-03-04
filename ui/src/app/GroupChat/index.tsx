import { IonPage, IonButton } from "@ionic/react";
import React, {useState, useEffect} from "react";
import { createGroup, addGroupMembers, removeGroupMembers, updateGroupName } from "../../redux/group/actions";
import { GroupConversation, UpdateGroupMembersIO, UpdateGroupNameIO } from "../../redux/group/types";
import { fetchAllUsernames } from "../../redux/contacts/actions";
import { useAppDispatch } from "../../utils/helpers";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { AgentPubKey } from "@holochain/conductor-api";

interface userData {
  id: AgentPubKey,
  username: string,
  isAdded: boolean,
}

const GroupChat: React.FC = () => {
  const [contacts, setContacts] = useState<AgentPubKey[]>([]);
  const dispatch = useAppDispatch();
  const groups = useSelector((state: RootState) => state.groups);
  const handleCreateGroup = () => {
    const agentPubKey: AgentPubKey = contacts[0];
    console.log(agentPubKey);
    const dummy_input = {
      name: "test03032021",
      members: [agentPubKey]
    };
    dispatch(createGroup(dummy_input)).then((res: GroupConversation) => {
      let dummy_input2: UpdateGroupMembersIO = {
        members: [contacts[1]],
        groupId: res.originalGroupEntryHash,
        groupRevisionId: res.originalGroupHeaderHash
      };
      console.log("create group is working perfectly fine!");
      console.log(res);
      dispatch(addGroupMembers(dummy_input2)).then((res: UpdateGroupMembersIO) => {
        let dummy_input3: UpdateGroupMembersIO = {
          members: [res.members[0]],
          groupId: res.groupId,
          groupRevisionId: res.groupRevisionId
        };
        console.log("adding works");
        console.log(res);

        dispatch(removeGroupMembers(dummy_input3)).then((res: UpdateGroupMembersIO)  => {
          let dummy_input4: UpdateGroupNameIO = {
            name: "this is a test!!",
            groupId: res.groupId,
            groupRevisionId: res.groupRevisionId
          };
          console.log("removing member is also working!")
          console.log(res)

          dispatch(updateGroupName(dummy_input4)).then((res: UpdateGroupNameIO) => {
            console.log("This means everything worked perfectly!");
            console.log(res);
          })
        })
      })
    });
  };

  useEffect(() => {
    dispatch(fetchAllUsernames()).then((res: userData[]) => {
      setContacts(res.map(x => x.id));
    });
  }, [groups])

  return (
      <IonPage>
        <IonButton onClick={handleCreateGroup}>
          Create group with 1 member
        </IonButton>
      </IonPage>
  )
}

export default GroupChat