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
import { Uint8ArrayToBase64, useAppDispatch, dateToTimestamp } from "../../utils/helpers";
import { Conversations as ConversationsType, Message } from "../../utils/types";
import EmptyConversations from "./EmptyConversations";
import { P2PMessageConversationState } from "../../redux/p2pmessages/types";
import { FilePayload, TextPayload } from "../../redux/commons/types";
import styles from "./style.module.css";

const Conversations: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const groupsData = useSelector(
    (state: RootState) => state.groups.conversations
  );
  const groupMessages = useSelector(
    (state: RootState) => state.groups.messages
  );
  const groupMembers = useSelector((state: RootState) => state.groups.members);
  const myUsername = useSelector((state: RootState) => state.profile.username);
  const p2pState = useSelector((state: RootState) => state.p2pmessages);
  const [myAgentId, setMyAgentId] = useState<string>("");
  const [groups, setGroups] = useState<{
    [key: string]: GroupConversation;
  }>({});

  const [groupMessagesLocal, setGroupMessagesLocal] = useState<{
    [key: string]: GroupMessage;
}>({});

  const handleOnClick = () => {
    history.push({
      pathname: `/compose`,
      state: { contacts: { ...contacts } },
    });
  };
  const renderConversation = (groups: {[key: string]: GroupConversation}, p2p: P2PMessageConversationState) => {
    let conversationsArray: any[] = [];

    if (p2p !== undefined) {
      for (let key in p2p.conversations) {
        let src = "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg";
        let conversant = contacts[key.slice(1)].username;
        
        let messages: Message[] = Object.values(p2p.conversations[key].messages).map(p2pMessageID => {
          let p2pMessage = p2p.messages[p2pMessageID];
          let message: Message = {
            id: p2pMessage.p2pMessageEntryHash,
            sender: {id: p2pMessage.author, username: p2pMessage.author === myAgentId ? "You" : conversant},
            message: p2pMessage.payload.type === "TEXT"
                      ? (p2pMessage.payload as TextPayload).payload.payload 
                      : (p2pMessage.payload as FilePayload).fileName,
            timestamp: dateToTimestamp(p2pMessage.timestamp)
          };
          return message;
        })

        messages.sort((x: Message, y: Message) => 
          y.timestamp.valueOf() < x.timestamp.valueOf() ? 1 : -1
        );
        
        let conversation = {
          isGroup: false,
          content: {
            src: src, 
            name: conversant, 
            messages: messages
          }
        };
        conversationsArray.push(conversation);
      }  
    }

    if (groups !== undefined) {
      Object.keys(groups).forEach((key: string ) => {
        // TODO: change to actual pic chosen by group creator
        let src = "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg";
        let messages: Message[] =  groups[key].messages ? groups[key].messages.map((messageId: string) => {
          console.log(groupMessagesLocal);
          let groupMessage: GroupMessage = Object.keys(groupMessagesLocal).length ? groupMessagesLocal[messageId] : groupMessages[messageId];
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
          isGroup: true,
          createdAt: groups[key].createdAt,
          groupId: groups[key].originalGroupEntryHash,
          content: { src, name: groups[key].name, messages },
        };
        
        if (!(conversationsArray.find((group: any) => group.id === conversation.groupId))) {
          conversationsArray.push(conversation);
        }
        
        });
    }
    // conversationsArray.sort((x: any, y: any) => {
    //   let timestampX = (x.content.messages.length !== 0) ?  x.content.messages[x.content.messages.length - 1].timestamp.valueOf() : x.createdAt.valueOf()
    //   let timestampY = (y.content.messages.length !== 0) ?  y.content.messages[x.content.messages.length - 1].timestamp.valueOf() : y.createdAt.valueOf()

    //   if (x.content.messages.length !== 0 || y.content.messages.length !== 0) {
    //     console.log("heello?");
    //     console.log(x.content.messages.length !== 0, y.content.messages.length !== 0)
    //   }

    //   return timestampX < timestampY ? 1 : -1
    // })

    return conversationsArray;
  };

  useEffect(() => {
    dispatch(fetchId()).then((res: AgentPubKey | null) => {
      if (res) setMyAgentId(Uint8ArrayToBase64(res));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    console.log("here is the groupData", groupsData)
    setGroups(groupsData);
  }, [groupsData])

  useEffect(() => {
    console.log("there are the messages", groupMessages);
    setGroupMessagesLocal(groupMessages);
  }, [groupMessages])

  return (
    <IonPage>
      <Toolbar noSearch onChange={() => {}} />
      <IonContent>
        {Object.keys(groups).length > 0 || p2pState !== undefined? (
          <IonList className={styles.conversation}>
            {renderConversation(groups, p2pState).map((conversation: any) => (
              <Conversation
                key={conversation.groupId !== undefined ? conversation.groupId : conversation.conversant}
                isGroup={conversation.isGroup}
                groupId={conversation.groupId !== undefined ? conversation.groupId : undefined}
                content={conversation.content}
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

export default Conversations;
