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
import Conversation2 from "../../components/Conversation2";
import Toolbar from "../../components/Toolbar";
import {
  Conversation,
  isTextPayload,
  Message,
} from "../../redux/commons/types";
import { getGroupConversationBadgeCount } from "../../redux/group/actions/getBadgeCount";
import { GroupConversationsState } from "../../redux/group/types";
import { countUnread } from "../../redux/p2pmessages/actions";
import { P2PMessageConversationState } from "../../redux/p2pmessages/types";
import { RootState } from "../../redux/types";
import { dateToTimestamp, useAppDispatch } from "../../utils/helpers";
import EmptyConversations from "./EmptyConversations";
import styles from "./style.module.css";

const Conversations: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const myProfile = useSelector((state: RootState) => state.profile);
  const groupsState = useSelector((state: RootState) => state.groups);
  const p2pState = useSelector((state: RootState) => state.p2pmessages);

  /* Handlers */
  const handleOnCompose = () => {
    history.push({
      pathname: `/compose`,
      state: { contacts: { ...contacts } },
    });
  };

  const handleOnClick = (conversation: Conversation) =>
    conversation.type === "group"
      ? history.push(`/g/${conversation.id}`)
      : history.push(`/u/${conversation.conversationName}`);
  /*
    Handle the construction of array of
    conversation detail merged from P2P and Group conversations
  */
  const constructConversations = (
    groupsState: GroupConversationsState,
    p2pState: P2PMessageConversationState
  ) => {
    let conversationsArray: Conversation[] = [];

    /* code block for p2p logic */
    if (Object.keys(p2pState.conversations).length > 0) {
      for (let key in p2pState.conversations) {
        if (contacts[key] === undefined) continue;
        /*
          we are not displaying people who are not in contacts list right now; this will not be undefined atm
          TODO: may change depending on design implementation for blocked contacts
          */
        let conversant = contacts[key].username;

        // accessing the first index for the latest message
        // TODO: make sure that this is the latest
        let latestMessageId = p2pState.conversations[key].messages[0];
        let latestMessage = p2pState.messages[latestMessageId];
        let message: Message = {
          id: latestMessage.p2pMessageEntryHash,
          sender: {
            id: latestMessage.author,
            username:
              latestMessage.author === myProfile.id ? "You" : conversant,
          },
          payloadType: latestMessage.payload.type,
          textPayload: isTextPayload(latestMessage.payload)
            ? latestMessage.payload.payload.payload
            : undefined,
          fileName: !isTextPayload(latestMessage.payload)
            ? latestMessage.payload.fileName
            : undefined,
          /* TODO: change to Date format */
          timestamp: dateToTimestamp(latestMessage.timestamp),
        };

        // create input to Conversation component
        let conversation: Conversation = {
          type: "p2p",
          id: key,
          conversationName: conversant,
          latestMessage: message,
          badgeCount: dispatch(countUnread(conversant)),
        };
        conversationsArray.push(conversation);
      }
    }
    /* end of code block for p2p logic */

    /* code block for group logic */
    if (Object.keys(groupsState.conversations).length > 0) {
      const allGroupMessages = groupsState.messages;
      const groupMembers = groupsState.members;

      Object.keys(groupsState.conversations).forEach((groupId: string) => {
        /* 
          TODO: Make sure that the index 0 is the latest message at all times
          especially when messages are received via signal or fetched
        */
        let latestMessageId = groupsState.conversations[groupId].messages[0];
        let latestMessage = allGroupMessages[latestMessageId];
        let message: Message = {
          id: latestMessage.groupMessageEntryHash,
          sender: groupMembers[latestMessage.author]
            ? {
                id: groupMembers[latestMessage.author].id,
                username: groupMembers[latestMessage.author].username,
              }
            : {
                id: myProfile.id!,
                username: myProfile.username!,
              },
          payloadType: latestMessage.payload.type,
          timestamp: latestMessage.timestamp,
          textPayload: isTextPayload(latestMessage.payload)
            ? latestMessage.payload.payload.payload
            : undefined,
          fileName: !isTextPayload(latestMessage.payload)
            ? latestMessage.payload.fileName
            : undefined,
        };

        let conversation: Conversation = {
          id: groupId,
          type: "group",
          conversationName: groupsState.conversations[groupId].name,
          latestMessage: message,
          badgeCount: dispatch(getGroupConversationBadgeCount(groupId)),
        };

        conversationsArray.push(conversation);
      });
    }
    /* end of code block for group logic */

    /* sort merged p2p and group conversations */
    conversationsArray.sort((x: any, y: any) => {
      let timestampX =
        x.content.messages.length !== 0
          ? x.content.messages[
              x.content.messages.length - 1
            ].timestamp.valueOf()
          : x.createdAt.valueOf();

      let timestampY =
        y.content.messages.length !== 0
          ? y.content.messages[
              y.content.messages.length - 1
            ].timestamp.valueOf()
          : y.createdAt.valueOf();

      return timestampX < timestampY ? 1 : -1;
    });

    return conversationsArray;
  };

  /* Rederer */

  /* Handle the display of conversations */
  const renderAllConversation = (conversationsArray: Conversation[]) => {
    Object.keys(conversationsArray).length > 0 ? (
      <IonList className={styles.conversation}>
        {conversationsArray.map((conversation: Conversation) => (
          <Conversation2
            conversation={conversation}
            myAgentId={myProfile.id!}
            onClick={() => handleOnClick(conversation)}
          />
        ))}
      </IonList>
    ) : (
      <EmptyConversations />
    );
  };

  return (
    <IonPage>
      <Toolbar noSearch onChange={() => {}} />
      <IonContent>
        {renderAllConversation(constructConversations(groupsState, p2pState))}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={pencil} onClick={handleOnCompose} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Conversations;
