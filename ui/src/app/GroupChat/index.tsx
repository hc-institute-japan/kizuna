import { AgentPubKey } from "@holochain/conductor-api";
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  createGroup,
  addGroupMembers,
  removeGroupMembers,
  updateGroupName,
  sendGroupMessage,
  getNextBatchGroupMessages,
  getMessagesByGroupByTimestamp,
} from "../../redux/group/actions";
import {
  GroupConversation,
  GroupMessageInput,
  UpdateGroupNameData,
  GroupMessage,
  UpdateGroupMembersData,
  GroupMessageBatchFetchFilter,
  GroupMessagesOutput,
  GroupMessageByDateFetchFilter
} from "../../redux/group/types";
import { RootState } from "../../redux/types";
import { FileMetadataInput } from "../../redux/commons/types"; 
import MessageList from "./MessageList";
import { base64ToUint8Array, Uint8ArrayToBase64, useAppDispatch } from "../../utils/helpers";
import {fetchId} from "../../redux/profile/actions";


import MessageInput from "../../components/MessageInput";
import { arrowBackSharp } from "ionicons/icons";

interface userData {
  id: string;
  username: string;
  isAdded: boolean;
}

interface GroupChatParams {
  group: string;
}

const GroupChat: React.FC = () => {
  const history = useHistory();
  const [myAgentId, setMyAgentId] = useState<string>("");
  const [message, setMessage] = useState("");
  const dispatch = useAppDispatch();
  const { group } = useParams<GroupChatParams>();
  const groupInfo = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );

  const handleOnSend = () => {
    let input: GroupMessageInput = {
      groupHash: base64ToUint8Array(groupInfo.originalGroupEntryHash),
      payloadInput: {
        type: "TEXT",
        payload: {payload: message}
      },
      sender: Buffer.from(base64ToUint8Array(myAgentId).buffer),
      // TODO: handle replying to message here as well
      replyTo: undefined,
    };

    // TODO: error handling
    dispatch(sendGroupMessage(input));
  };

  const handleOnBack = () => {
    history.push({
      pathname: `/home`,
    });
  };


  useEffect(() => {
  dispatch(fetchId()).then((res: AgentPubKey | null) => {
    if (res) setMyAgentId(Uint8ArrayToBase64(res))
  });
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton  onClick={() => handleOnBack()} className="ion-no-padding" >
              <IonIcon slot="icon-only" icon={arrowBackSharp} />  
            </IonButton>
            <IonAvatar className="ion-padding">
              {/* TODO: proper picture for default avatar if none is set */}
              {groupInfo.avatar ? <img src={groupInfo.avatar} alt={groupInfo.name} /> : <img src={"https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg"} alt={groupInfo.name} />}
            </IonAvatar>
            <IonTitle className="ion-no-padding"> {groupInfo.name}</IonTitle>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {groupInfo ? (
          <MessageList
            myAgentId={myAgentId}
            members={groupInfo.members}
            messageIds={groupInfo.messages}
          ></MessageList>
        ) : null}
      </IonContent>
      {/* BUG: the input field does not reset to empty after send */}
      <MessageInput
          onSend={() => handleOnSend()}
          onChange={(message) => setMessage(message)}
          onFileSelect={() => {}}
        />
    </IonPage>
  );
};

export default GroupChat;