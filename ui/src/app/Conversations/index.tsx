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
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import Conversation from "../../components/Conversation";
import Toolbar from "../../components/Toolbar";
import {
  Conversation as ConversationDetail,
  isTextPayload,
  Message,
} from "../../redux/commons/types";
import { getBadgeCount } from "../../redux/group/actions";
import { GroupConversationsState } from "../../redux/group/types";
import { countUnread } from "../../redux/p2pmessages/actions/countUnread";
import { P2PMessageConversationState } from "../../redux/p2pmessages/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import EmptyConversations from "./EmptyConversations";
import styles from "./style.module.css";

const Conversations: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const intl = useIntl();

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

  const handleOnClick = (conversation: ConversationDetail) =>
    conversation.type === "group"
      ? history.push(`/g/${conversation.id}`)
      : history.push({
          pathname: `/u/${conversation.id}`,
          state: { username: conversation.conversationName },
        });
  /*
    Handle the construction of array of
    conversation detail merged from P2P and Group conversations
  */
  const constructConversations = (
    groupsState: GroupConversationsState,
    p2pState: P2PMessageConversationState
  ) => {
    let conversationsArray: ConversationDetail[] = [];

    /* code block for p2p logic */
    if (Object.keys(p2pState.conversations).length > 0) {
      for (let key in p2pState.conversations) {
        if (contacts[key] === undefined) continue;
        /*
          we are not displaying people who are not in contacts list right now; this will not be undefined atm
          TODO: may change depending on design implementation for blocked contacts
          */
        const conversant = contacts[key];

        // accessing the first index for the latest message
        // TODO: make sure that this is the latest
        const latestMessageId = p2pState.conversations[key].messages[0];
        const latestMessage = p2pState.messages[latestMessageId];
        let message: Message;
        let conversation: ConversationDetail | null = null;
        if (latestMessage) {
          message = {
            id: latestMessage.p2pMessageEntryHash,
            sender: {
              id: latestMessage.author.id,
              username:
                latestMessage.author.id === myProfile.id
                  ? "You"
                  : conversant.username,
              fields:
                latestMessage.author.id === myProfile.id
                  ? myProfile.fields
                  : conversant.fields,
            },
            payloadType: latestMessage.payload.type,
            textPayload: isTextPayload(latestMessage.payload)
              ? latestMessage.payload.payload.payload
              : undefined,
            fileName: !isTextPayload(latestMessage.payload)
              ? latestMessage.payload.fileName
              : undefined,
            /* TODO: change to Date format */
            timestamp: latestMessage.timestamp,
          };
          // create input to Conversation component
          conversation = {
            type: "p2p",
            id: key,
            avatar: conversant.fields.avatar
              ? conversant.fields.avatar
              : undefined,
            conversationName: conversant.username,
            latestMessage: message,
            badgeCount: dispatch(countUnread(conversant.id)),
          };
        } else if (p2pState.errMsgs[key][0]) {
          const latestErrMessage = p2pState.errMsgs[key][0];
          message = {
            id: latestErrMessage.p2pMessageEntryHash,
            sender: {
              id: latestErrMessage.author.id,
              username:
                latestErrMessage.author.id === myProfile.id
                  ? "You"
                  : conversant.username,
              fields:
                latestErrMessage.author.id === myProfile.id
                  ? myProfile.fields
                  : conversant.fields,
            },
            payloadType: latestErrMessage.payload.type,
            textPayload: isTextPayload(latestErrMessage.payload)
              ? latestErrMessage.payload.payload.payload
              : undefined,
            fileName: !isTextPayload(latestErrMessage.payload)
              ? latestErrMessage.payload.fileName
              : undefined,
            /* TODO: change to Date format */
            timestamp: latestErrMessage.timestamp,
          };
          // create input to Conversation component
          conversation = {
            type: "p2p",
            id: key,
            conversationName: conversant.username,
            latestMessage: message,
            badgeCount: dispatch(countUnread(conversant.id)),
          };
        }

        if (conversation) conversationsArray.push(conversation);
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
        const latestMessageId = groupsState.conversations[groupId].messages[0];
        const latestMessage = allGroupMessages[latestMessageId];
        let message: Message;
        let conversation: ConversationDetail | null = null;
        if (latestMessage) {
          message = {
            id: latestMessage.groupMessageId,
            sender: groupMembers[latestMessage.author]
              ? {
                  id: groupMembers[latestMessage.author].id,
                  username: groupMembers[latestMessage.author].username,
                  fields: groupMembers[latestMessage.author].fields,
                }
              : {
                  id: myProfile.id!,
                  username: myProfile.username!,
                  fields: myProfile.fields,
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
          conversation = {
            id: groupId,
            type: "group",
            conversationName: groupsState.conversations[groupId].name,
            latestMessage: message,
            // enable this once we have a better implementation of read message
            badgeCount: dispatch(getBadgeCount(groupId)),
          };
        } else if (groupsState.errMsgs[groupId]) {
          const latestErrMessage = groupsState.errMsgs[groupId][0];
          message = {
            id: latestErrMessage.groupMessageId,
            sender: latestErrMessage.author,
            payloadType: latestErrMessage.payload.type,
            timestamp: latestErrMessage.timestamp,
            textPayload: isTextPayload(latestErrMessage.payload)
              ? latestErrMessage.payload.payload.payload
              : undefined,
            fileName: !isTextPayload(latestErrMessage.payload)
              ? latestErrMessage.payload.fileName
              : undefined,
          };
          conversation = {
            id: groupId,
            type: "group",
            conversationName: groupsState.conversations[groupId].name,
            latestMessage: message,
            badgeCount: dispatch(getBadgeCount(groupId)),
          };
        } else {
          // edge case: group was created but no message was sent
          // and the user refreshed the browser so errMessage disappears too
          // TODO: remove this section once err messages are cached.
          message = {
            id: "no message",
            sender: undefined,
            payloadType: "TEXT",
            timestamp: new Date(),
            textPayload: intl.formatMessage({
              id: "app.conversations.no-group-messages",
            }),
            fileName: undefined,
          };
          conversation = {
            id: groupId,
            type: "group",
            conversationName: groupsState.conversations[groupId].name,
            latestMessage: message,
            badgeCount: dispatch(getBadgeCount(groupId)),
          };
        }

        if (conversation) conversationsArray.push(conversation);
      });
    }
    /* end of code block for group logic */

    /* sort merged p2p and group conversations */
    conversationsArray.sort((x: ConversationDetail, y: ConversationDetail) => {
      let timestampX = x.latestMessage.timestamp.valueOf();
      let timestampY = y.latestMessage.timestamp.valueOf();
      return timestampX < timestampY ? 1 : -1;
    });

    return conversationsArray;
  };

  /* Rederer */

  /* Handle the display of conversations */
  const renderAllConversation = (conversationsArray: ConversationDetail[]) => {
    return Object.keys(conversationsArray).length > 0 ? (
      <IonList className={styles.conversation}>
        {conversationsArray.map((conversation: ConversationDetail) => (
          <Conversation
            key={conversation.id}
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
          <IonFabButton onClick={handleOnCompose}>
            <IonIcon icon={pencil} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Conversations;
