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
import Conversation2, { MessageDetail } from "../../components/Conversation2";
import Toolbar from "../../components/Toolbar";
import { GroupConversation, GroupMessage } from "../../redux/group/types";
import { getAgentId } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import {
  Uint8ArrayToBase64,
  useAppDispatch,
  dateToTimestamp,
  timestampToDate,
} from "../../utils/helpers";
import EmptyConversations from "./EmptyConversations";
import { P2PMessageConversationState } from "../../redux/p2pmessages/types";
import {
  FilePayload,
  TextPayload,
  Message,
  Conversation,
  isTextPayload,
} from "../../redux/commons/types";
import styles from "./style.module.css";
import { countUnread } from "../../redux/p2pmessages/actions";

const Conversations: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  // const [latestMessageDetail, setLatestMessageDetail] = useState<MessageDetail>({
  //   message: "",
  //   fileName: "",
  //   payload: "TEXT",
  // });

  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const groupsData = useSelector(
    (state: RootState) => state.groups.conversations
  );
  const allGroupMessages = useSelector(
    (state: RootState) => state.groups.messages
  );
  const groupMembers = useSelector((state: RootState) => state.groups.members);
  const myUsername = useSelector((state: RootState) => state.profile.username);
  const p2pState = useSelector((state: RootState) => state.p2pmessages);
  const [myAgentId, setMyAgentId] = useState<string>("");
  const [groups, setGroups] = useState<{
    [key: string]: GroupConversation;
  }>({});

  const handleOnClick = () => {
    history.push({
      pathname: `/compose`,
      state: { contacts: { ...contacts } },
    });
  };

  // useEffect(() => {
  //   if(type === 'group')
  //     setBadgeCount(dispatch(getBadgeCount()))
  //   }, [
  //     messages[groupId].something
  //   ]
  // )

  /*
    Handle the display of Conversations
  */
  const constructConversations = async (
    groups: { [key: string]: GroupConversation },
    p2p: P2PMessageConversationState
  ) => {
    let conversationsArray: Conversation[] = [];

    /* code block for p2p logic */
    if (Object.keys(p2p.conversations).length > 0) {
      for (let key in p2p.conversations) {
        if (contacts[key] === undefined) continue;
        /*
          we are not displaying people who are not in contacts list right now; this will not be undefined atm
          TODO: may change depending on design implementation for blocked contacts
          */
        let conversant = contacts[key].username;

        // accessing the first index for the latest message
        // TODO: make sure that this is the latest
        let latestMessageId = p2p.conversations[key].messages[0];
        let latestMessage = p2p.messages[latestMessageId];
        let message: Message = {
          id: latestMessage.p2pMessageEntryHash,
          sender: {
            id: latestMessage.author,
            username: latestMessage.author === myAgentId ? "You" : conversant,
          },
          payloadType: latestMessage.payload.type,
          textPayload: isTextPayload(latestMessage.payload)
            ? latestMessage.payload.payload.payload
            : undefined,
          fileName:
            latestMessage.payload.type === "FILE"
              ? latestMessage.payload.fileName
              : undefined,
          /* TODO: change to Date format */
          timestamp: dateToTimestamp(latestMessage.timestamp),
        };

        // create input to Conversation component
        let conversation: Conversation = {
          id: key,
          conversationName: conversant,
          latestMessage: message,
          badgeCount: await dispatch(countUnread(conversant)),
        };
        conversationsArray.push(conversation);
      }
    }
    /* end of code block for p2p logic */

    /* code block for group logic */
    if (Object.keys(groups).length > 0) {
      Object.keys(groups).forEach((key: string) => {
        let messages: (Message | undefined)[] = groups[key].messages
          ? groups[key].messages.map((messageId: string) => {
              let groupMessage = Object.keys(groupMessagesLocal).length
                ? groupMessagesLocal[messageId]
                : groupMessages[messageId];

              if (groupMessage) {
                if (isTextPayload(groupMessage.payload)) {
                  let message: Message = {
                    id: groupMessage.groupMessageEntryHash,
                    sender: groupMembers[groupMessage.author]
                      ? {
                          id: groupMembers[groupMessage.author].id,
                          username: groupMembers[groupMessage.author].username,
                        }
                      : {
                          id: myAgentId,
                          username: myUsername!,
                        },
                    timestamp: groupMessage.timestamp,
                    message: groupMessage.payload.payload.payload,
                  };
                  return message;
                } else {
                  let message: Message = {
                    id: groupMessage.groupMessageEntryHash,
                    sender: groupMembers[groupMessage.author]
                      ? {
                          id: groupMembers[groupMessage.author].id,
                          username: groupMembers[groupMessage.author].username,
                        }
                      : {
                          id: myAgentId,
                          username: myUsername!,
                        },
                    timestamp: groupMessage.timestamp,
                    message: "",
                    fileName: groupMessage.payload.fileName,
                  };
                  return message;
                }
              }
            })
          : [];
        let messagesCleaned = messages.flatMap((x: Message | undefined) =>
          x ? [x] : []
        );
        messagesCleaned = messagesCleaned.sort((x: Message, y: Message) =>
          y.timestamp.valueOf() < x.timestamp.valueOf() ? 1 : -1
        );
        let conversation = {
          isGroup: true,
          createdAt: groups[key].createdAt,
          groupId: groups[key].originalGroupEntryHash,
          content: { src, name: groups[key].name, messages: messagesCleaned },
        };

        if (
          !conversationsArray.find(
            (group: any) => group.id === conversation.groupId
          )
        ) {
          conversationsArray.push(conversation);
        }
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

  useEffect(() => {
    dispatch(getAgentId()).then((myAgentPubKey: AgentPubKey | null) => {
      if (myAgentPubKey) setMyAgentId(Uint8ArrayToBase64(myAgentPubKey));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setGroups(groupsData);
  }, [groupsData]);

  useEffect(() => {
    setLatestMessageDetail(
      messages.length === 0
        ? {
            message: "",
            payload: "TEXT",
          }
        : messages.length === 1
        ? {
            message: messages[0].message,
            sender: messages[0].sender,
            fileName: messages[0].fileName ? messages[0].fileName : undefined,
            payload: messages[0].fileName ? "FILE" : "TEXT",
          }
        : {
            message: messages[messages.length - 1].message,
            sender: messages[messages.length - 1].sender,
            fileName: messages[messages.length - 1].fileName
              ? messages[messages.length - 1].fileName
              : undefined,
            payload: messages[messages.length - 1].fileName ? "FILE" : "TEXT",
          }
    );
    messages.sort((x: Message, y: Message) => {
      return x.timestamp[0] - y.timestamp[0];
    });
  }, [messages]);

  return (
    <IonPage>
      <Toolbar noSearch onChange={() => {}} />
      <IonContent>
        {Object.keys(groups).length > 0 ||
        Object.keys(p2pState.conversations).length > 0 ? (
          <IonList className={styles.conversation}>
            {constructConversations(groups, p2pState).map(
              (conversation: Conversation) => (
                <Conversation2
                  latestMessageDetail={}
                  type={conversation.isGroup ? "group" : "p2p"}
                  key={conversation.groupId}
                  isGroup={conversation.isGroup}
                  groupId={conversation.groupId}
                  content={conversation.content}
                  myAgentId={myAgentId}
                  onClick={() =>
                    conversation.isGroup
                      ? history.push(`/g/${conversation.groupId}`)
                      : history.push(`/u/${conversation.content.name}`)
                  }
                />
              )
            )}
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
