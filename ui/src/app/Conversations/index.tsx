import { AgentPubKey } from "@holochain/conductor-api";
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonPage,
} from "@ionic/react";
import { pencil } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import Conversation from "../../components/Conversation";
import Toolbar from "../../components/Toolbar";
import { isTextPayload } from "../../redux/commons/types";
import { GroupConversation, GroupMessage } from "../../redux/group/types";
import { fetchId } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import { Uint8ArrayToBase64, useAppDispatch } from "../../utils/helpers";
import { Message } from "../../utils/types";
import EmptyConversations from "./EmptyConversations";
import styles from "./style.module.css";

const Conversations: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const [groups, setGroups] = useState<{
    [key: string]: GroupConversation;
}>({});
  const groupsData = useSelector((state: RootState) => state.groups.conversations);
  const groupMessages = useSelector((state: RootState) => state.groups.messages);
  const groupMembers = useSelector((state: RootState) => state.groups.members);
  const myUsername = useSelector((state: RootState) => state.profile.username);
  const [myAgentId, setMyAgentId] = useState<string>("");

  const handleOnClick = () => {
    history.push({
      pathname: `/compose`,
      state: { contacts: {...contacts} },
    });
  };
  const renderGroupConversation = (groups:  {
    [key: string]: GroupConversation;
  }) => {
  let arr: any[] = [];
  Object.keys(groups).forEach((key: string ) => {
    // TODO: change to actual pic chosen by group creator
    let src = "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg";
    let messages: Message[] =  groups[key].messages ? groups[key].messages.map((messageId: string) => {
      let groupMessage: GroupMessage = groupMessages[messageId];
      if (isTextPayload(groupMessage.payload)) {
        let message: Message = {
          id: groupMessage.groupMessageEntryHash,
          sender: groupMembers[groupMessage.author] ? {
            id: groupMembers[groupMessage.author].id,
            username: groupMembers[groupMessage.author].username
          } : {
            id: myAgentId,
            username: myUsername!
          },
          timestamp: groupMessage.timestamp,
          message: groupMessage.payload.payload.payload
        };
        return message
      } else {
        let maybeOther: any | undefined = groupMembers[groupMessage.author];
        let fileString: string = "";
        if (maybeOther) {
          // TODO: format for i18n
          fileString = String(maybeOther.username + " has sent " + groupMessage.payload.fileName).toString();
        } else {
          // MAYBE BUG: assumption is you sent it.
          // TODO: format for i18n
          fileString = String("You sent " + groupMessage.payload.fileName).toString();
        }
        
        let message: Message = {
          id: groupMessage.groupMessageEntryHash,
          sender: groupMembers[groupMessage.author] ? {
            id: groupMembers[groupMessage.author].id,
            username: groupMembers[groupMessage.author].username
          } : {
            id: myAgentId,
            username: myUsername!
          },
          timestamp: groupMessage.timestamp,
          // TODO: this part is file
          message: fileString,
          fileName: groupMessage.payload.fileName
        };
        return message
      };
    }) : [];
    messages.sort((x: Message, y: Message) => 
      y.timestamp.valueOf() < x.timestamp.valueOf() ? 1 : -1
    );
    let conversation = {
      id: groups[key].originalGroupEntryHash,
      content: { src, name: groups[key].name, messages, },
    };
    
    if (!(arr.find((group: any) => group.id === conversation.id))) {
      arr.push(conversation);
    }
    
    });
    arr.sort((x: any, y: any) => 
      groups[x.id].createdAt.valueOf() < groups[y.id].createdAt.valueOf() ? 1 : -1
    );
    return arr;
  };

  useEffect(() => {
    dispatch(fetchId()).then((res: AgentPubKey | null) => {
      if (res) setMyAgentId(Uint8ArrayToBase64(res))
    });
    setGroups(groupsData);
    }, [groupsData, dispatch])

  return (
    <IonPage>
      <Toolbar onChange={() => {}} />
      <IonContent>
        {Object.keys(groups).length > 0 ? (
          <IonList className={styles.conversation}>
            {renderGroupConversation(groups).map((groupConversation: any) => (
              <Conversation
                isGroup={true}
                groupId={groupConversation.id}
                key={JSON.stringify(groupConversation.id)}
                content={groupConversation.content}
                myAgentId={myAgentId}
              />
            ))}
          </IonList>
        ) : (
          <EmptyConversations />
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={pencil} onClick={handleOnClick} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Conversations
