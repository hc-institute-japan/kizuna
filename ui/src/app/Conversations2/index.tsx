import { AgentPubKey } from "@holochain/conductor-api";
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonPage,
} from "@ionic/react";
import {
  pencil,
  peopleCircleOutline,
  personCircleOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import Conversation2, { MessageDetail } from "../../components/Conversation2";
import Toolbar from "../../components/Toolbar";
import { isTextPayload } from "../../redux/commons/types";
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
import { FilePayload, TextPayload } from "../../redux/commons/types";
import styles from "./style.module.css";
import { Profile } from "../../redux/profile/types";

export interface Message {
  id: string;
  sender: Profile;
  fileName?: string;
  timestamp: Date;
  message: string;
}

const Conversations: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [latestMessageDetail, setLatestMessageDetail] = useState<MessageDetail>({
    message: "",
    fileName: "",
    payload: "TEXT",
  });

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

  useEffect(() => { 
    if(type === 'group')
      setBadgeCount(dispatch(getBadgeCount()))
    }, [ 
      messages[groupId].something
    ]
  )

  /*
    Handle the display of Conversations
  */
  const renderConversation = (
    groups: { [key: string]: GroupConversation },
    p2p: P2PMessageConversationState
  ) => {
    let conversationsArray: any[] = [];

    /* code block for p2p logic */
    if (p2p !== undefined) {
      for (let key in p2p.conversations) {
        // do not display people who are not in contacts list
        // TODO: may change depending on design implementation for blocked contacts
        if (contacts[key.slice(1)] === undefined) continue;

        let src = personCircleOutline;
        let conversant = contacts[key.slice(1)].username;

        let messages: Message[] = Object.values(
          p2p.conversations[key].messages
        ).map((p2pMessageID) => {
          // convert p2pMessage to Message as input to Conversation component
          let p2pMessage = p2p.messages[p2pMessageID];
          let message: Message = {
            id: p2pMessage.p2pMessageEntryHash,
            sender: {
              id: p2pMessage.author,
              username: p2pMessage.author === myAgentId ? "You" : conversant,
            },
            message:
              p2pMessage.payload.type === "TEXT"
                ? (p2pMessage.payload as TextPayload).payload.payload
                : (p2pMessage.payload as FilePayload).fileName,
            timestamp: p2pMessage.timestamp),
          };
          return message;
        });

        // sort messages according to time sent
        messages.sort((x: Message, y: Message) =>
          y.timestamp.valueOf() < x.timestamp.valueOf() ? 1 : -1
        );

        // create input to Conversation component
        let conversation = {
          groupId: key,
          isGroup: false,
          content: {
            src: src,
            name: conversant,
            messages: messages,
          },
        };
        conversationsArray.push(conversation);
      }
    }
    /* end of code block for p2p logic */

    /* code block for group logic */
    if (Object.keys(groups).length > 0) {
      Object.keys(groups).forEach((key: string) => {

        /* TODO: change to actual pic chosen by group creator */
        let src = peopleCircleOutline;

        let messages: Message[] = groups[key].messages
          ? groups[key].messages.map((messageId: string) => {

            let groupMessage: GroupMessage = allGroupMessages[messageId];

            if (isTextPayload(groupMessage.payload)) {
              let message: Message = {
                id: groupMessage.groupMessageEntryHash,
                /* 
                  Check whether the sender is self or others 
                  and retrieve the username from appropriate redux store 
                */
                sender: groupMembers[groupMessage.author]
                  ? {
                      id: groupMembers[groupMessage.author].id,
                      username: groupMembers[groupMessage.author].username,
                    }
                  : {
                      id: myAgentId,
                      username: myUsername!,
                    },
                timestamp: timestampToDate(groupMessage.timestamp),
                message: groupMessage.payload.payload.payload,
              };
              return message;
            } else {
              /* */
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
                timestamp: timestampToDate(groupMessage.timestamp),
                message: "",
                fileName: groupMessage.payload.fileName,
              };
              return message;
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
            {renderConversation(groups, p2pState).map((conversation: any) => (
              <Conversation2
                latestMessageDetail={}
                type={conversation.isGroup ? "group" : "p2p"}
                key={conversation.groupId}
                isGroup={conversation.isGroup}
                groupId={conversation.groupId}
                content={conversation.content}
                myAgentId={myAgentId}
                onClick={() => conversation.isGroup ? history.push(`/g/${conversation.groupId}`) : history.push(`/u/${conversation.content.name}`)}
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
