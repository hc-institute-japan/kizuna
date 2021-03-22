import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonPage,
} from "@ionic/react";
import { pencil } from "ionicons/icons";
import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import Conversation from "../../components/Conversation";
import Toolbar from "../../components/Toolbar";
import { isTextPayload } from "../../redux/commons/types";
import { GroupConversation, GroupConversationsActionTypes, GroupMessage } from "../../redux/group/types";
import { RootState } from "../../redux/types";
import { Conversations as ConversationsType, Message } from "../../utils/types";
import EmptyConversations from "./EmptyConversations";
import styles from "./style.module.css";

const Conversations: React.FC = () => {
  const history = useHistory();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const groups = useSelector((state: RootState) => state.groups.conversations);
  const groupMessages = useSelector((state: RootState) => state.groups.messages);
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
    let messages: Message[] = groups[key].messages.map((messageId: string) => {
      let groupMessage: GroupMessage = groupMessages[messageId];
      if (isTextPayload(groupMessage.payload)) {
        let message: Message = {
          id: groupMessage.groupMessageEntryHash,
          sender: groupMessage.author,
          timestamp: groupMessage.timestamp,
          message: groupMessage.payload.payload.payload
        };
        return message
      } else {
        let message: Message = {
          id: groupMessage.groupMessageEntryHash,
          sender: groupMessage.author,
          timestamp: groupMessage.timestamp,
          // TODO: this part is file
          message: "This is a placeholder"
        };
        return message
      };
    })
    messages.sort((x: Message, y: Message) => 
      y.timestamp.valueOf() < x.timestamp.valueOf() ? 1 : -1
    );
    let conversation = {
      id: groups[key].originalGroupEntryHash,
      content: { src, name: groups[key].name, messages, },
    }
    arr.push(conversation);
    });
    arr.sort((x: any, y: any) => 
      groups[x.id].createdAt.valueOf() < groups[y.id].createdAt.valueOf() ? 1 : -1
    );
    return arr;
  };

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
              />
            ))}
          </IonList>
        ) : (
          <EmptyConversations />
        )}

        <IonFab vertical="bottom" horizontal="end">
          <IonFabButton>
            <IonIcon icon={pencil} onClick={handleOnClick} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Conversations
