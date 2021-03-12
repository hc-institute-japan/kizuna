// import {
//   IonBackButton,
//   IonButtons,
//   IonContent,
//   IonHeader,
//   IonPage,
//   IonToolbar,
// } from "@ionic/react";
// import React from "react";
// import { useSelector } from "react-redux";
// import { useParams } from "react-router";
// import { RootState } from "../../redux/types";
// import MessageList from "./MessageList";

// interface GroupChatParams {
//   group: string;
// }

// const GroupChat: React.FC = () => {
//   const { group } = useParams<GroupChatParams>();
//   const groupInfo = useSelector(
//     (state: RootState) => state.groupConversations.conversations[group]
//   );

//   console.log(groupInfo);

//   return (
//     <IonPage>
//       <IonHeader>
//         <IonToolbar>
//           <IonButtons>
//             <IonBackButton defaultHref="/home" />
//           </IonButtons>
//         </IonToolbar>
//       </IonHeader>

//       <IonContent>
//         {groupInfo ? (
//           <MessageList
//             members={groupInfo.versions[0].conversants}
//             messageIds={groupInfo.messages}
//           ></MessageList>
//         ) : null}
//       </IonContent>
//     </IonPage>
//   );
// };

// export default GroupChat;

import { IonPage, IonButton } from "@ionic/react";
import React, { useState, useEffect } from "react";
import {
  createGroup,
  addGroupMembers,
  removeGroupMembers,
  updateGroupName,
  sendGroupMessage,
} from "../../redux/group/actions";
import {
  GroupConversation,
  GroupMessageInput,
  UpdateGroupMembersIO,
  UpdateGroupNameIO,
  GroupMessage,
  FileMetadataInput,
} from "../../redux/group/types";
import { fetchAllUsernames } from "../../redux/contacts/actions";
import { useAppDispatch } from "../../utils/helpers";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/types";
import { AgentPubKey } from "@holochain/conductor-api";

interface userData {
  id: AgentPubKey;
  username: string;
  isAdded: boolean;
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
      members: [agentPubKey],
    };
    // 1 - create group
    dispatch(createGroup(dummy_input)).then((res: GroupConversation) => {
      console.log("create group is working perfectly fine!");
      console.log(res);

      let dummy_input2: UpdateGroupMembersIO = {
        members: [contacts[1]],
        groupId: res.originalGroupEntryHash,
        groupRevisionId: res.originalGroupHeaderHash,
      };
      // 2 - add group members
      dispatch(addGroupMembers(dummy_input2)).then(
        (res: UpdateGroupMembersIO) => {
          console.log("adding works");
          console.log(res);

          let dummy_input3: UpdateGroupMembersIO = {
            members: [res.members[0]],
            groupId: res.groupId,
            groupRevisionId: res.groupRevisionId,
          };
          // 3 - remove group members
          dispatch(removeGroupMembers(dummy_input3)).then(
            (res: UpdateGroupMembersIO) => {
              console.log("removing member is also working!");
              console.log(res);

              let dummy_input4: UpdateGroupNameIO = {
                name: "this is a test!!",
                groupId: res.groupId,
                groupRevisionId: res.groupRevisionId,
              };
              // 4 - update group name
              dispatch(updateGroupName(dummy_input4)).then(
                (res: UpdateGroupNameIO) => {
                  console.log("This means update group name is working!");
                  console.log(res);

                  let dummy_input5: GroupMessageInput = {
                    groupHash: res.groupId,
                    payloadInput: {
                      type: "TEXT",
                      payload: { payload: "this is obviously a test!!" },
                    },
                    sender: agentPubKey,
                    replyTo: undefined,
                  };
                  // 5 - send group message
                  dispatch(sendGroupMessage(dummy_input5)).then(
                    (res: GroupMessage) => {
                      console.log(
                        "This means sending of message is also working fine!"
                      );
                      console.log(res);

                      let metadata: FileMetadataInput = {
                        fileName: "test_file_1",
                        fileSize: 20,
                        fileType: "Other",
                      };
                      let dummy_bytes = Uint8Array.from([
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                      ]);

                      // let blob = new Blob([""], { type: 'text/html' });
                      // let fakeF = <File>blob;

                      let dummy_input6: GroupMessageInput = {
                        groupHash: res.groupEntryHash,
                        payloadInput: {
                          type: "FILE",
                          payload: {
                            metadata,
                            fileType: { type: "OTHER", payload: null },
                            fileBytes: dummy_bytes,
                          },
                        },
                        sender: agentPubKey,
                        replyTo: undefined,
                      };

                      dispatch(sendGroupMessage(dummy_input6)).then(
                        (res: GroupMessage) => {
                          console.log(
                            "This means sending of FILE is also working fine!"
                          );
                          console.log(res);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  };

  useEffect(() => {
    dispatch(fetchAllUsernames()).then((res: userData[]) => {
      setContacts(res.map((x) => x.id));
      console.log(groups);
    });
  }, [groups]);

  return (
    <IonPage>
      <IonButton onClick={handleCreateGroup}>
        Create group with 1 member
      </IonButton>
    </IonPage>
  );
};

export default GroupChat;
