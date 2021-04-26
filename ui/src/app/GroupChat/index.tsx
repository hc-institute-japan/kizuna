import { AgentPubKey } from "@holochain/conductor-api";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import {
  sendGroupMessage,
  getLatestGroupVersion,
  indicateGroupTyping,
} from "../../redux/group/actions";
import {
  GroupConversation,
  GroupMessageInput,
  GroupMessage,
} from "../../redux/group/types";
import { RootState } from "../../redux/types";
import { FilePayloadInput } from "../../redux/commons/types";
import MessageList from "./MessageList";
import {
  base64ToUint8Array,
  Uint8ArrayToBase64,
  useAppDispatch,
} from "../../utils/helpers";
import { fetchId } from "../../redux/profile/actions";

import MessageInput from "../../components/MessageInput";
import {
  arrowBackSharp,
  informationCircleOutline,
  peopleCircleOutline,
} from "ionicons/icons";
import { ChatListMethods } from "../../components/Chat/types";
import styles from "./style.module.css";
import Typing from "../../components/Chat/Typing";

interface GroupChatParams {
  group: string;
}

const GroupChat: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { group } = useParams<GroupChatParams>();
  const chatList = useRef<ChatListMethods>(null);

  // local states
  const [myAgentId, setMyAgentId] = useState<string>("");
  const [files, setFiles] = useState<object[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupConversation | undefined>();
  const [messages, setMessages] = useState<string[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingLoading, setSendingLoading] = useState<boolean>(false);
  const [message, setMessage] = useState("");

  // Selectors
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );

  const typing = useSelector((state: RootState) => state.groups.typing);

  // Handlers
  const handleOnSend = () => {
    setSendingLoading(true);
    let inputs: GroupMessageInput[] = [];
    if (files.length) {
      files.forEach((file: any) => {
        let filePayloadInput: FilePayloadInput = {
          type: "FILE",
          payload: {
            metadata: {
              fileName: file.metadata.fileName,
              fileSize: file.metadata.fileSize,
              fileType: file.metadata.fileType,
            },
            fileType: file.fileType,
            fileBytes: file.fileBytes,
          },
        };
        let groupMessage: GroupMessageInput = {
          groupHash: base64ToUint8Array(groupInfo!.originalGroupEntryHash),
          payloadInput: filePayloadInput,
          sender: Buffer.from(base64ToUint8Array(myAgentId).buffer),
          // TODO: handle replying to message here as well
          replyTo: undefined,
        };
        inputs.push(groupMessage);
      });
    }
    if (message.length) {
      inputs.push({
        groupHash: base64ToUint8Array(groupInfo!.originalGroupEntryHash),
        payloadInput: {
          type: "TEXT",
          payload: { payload: message },
        },
        sender: Buffer.from(base64ToUint8Array(myAgentId).buffer),
        // TODO: handle replying to message here as well
        replyTo: undefined,
      });
    }

    const messagePromises = inputs.map((groupMessage: any) =>
      // TODO: error handling
      dispatch(sendGroupMessage(groupMessage))
    );

    Promise.all(messagePromises).then((sentMessages: GroupMessage[]) => {
      sentMessages.forEach((msg: GroupMessage, i) => {
        setMessages([...messages!, msg.groupMessageEntryHash]);
      });
      setSendingLoading(false);
      chatList.current!.scrollToBottom();

    });
  };

  const handleOnBack = () => {
    history.push({
      pathname: `/home`,
    });
  };

  useEffect(() => {
    // setLoading(true);
    dispatch(fetchId()).then((res: AgentPubKey | null) => {
      if (res) setMyAgentId(Uint8ArrayToBase64(res));
    });
  }, [dispatch]);

  useEffect(() => {
    if (groupData) {
      setGroupInfo(groupData);
      setMessages(groupData.messages)
      setLoading(false);
    } else {
      dispatch(getLatestGroupVersion(group)).then((res: GroupConversation) => {
        setGroupInfo(res);
        setMessages(res.messages)
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return !loading && groupInfo && messages ? (
    <IonPage>
      <IonLoading isOpen={sendingLoading} />
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton
              onClick={() => handleOnBack()}
              className="ion-no-padding"
            >
              <IonIcon slot="icon-only" icon={arrowBackSharp} />
            </IonButton>
            <IonAvatar className="ion-padding">
              {/* TODO: proper picture for default avatar if none is set */}
              {groupInfo ? (
                groupInfo!.avatar ? (
                  <img src={groupInfo!.avatar} alt={groupInfo!.name} />
                ) : (
                  <img
                    className={styles.avatar}
                    src={peopleCircleOutline}
                    alt={groupInfo!.name}
                  />
                )
              ) : (
                <img src={peopleCircleOutline} alt={groupInfo!.name} />
              )}
            </IonAvatar>
            <IonTitle className="ion-no-padding"> {groupInfo!.name}</IonTitle>
            <IonButton
              onClick={() => {
                history.push(`/g/${groupInfo.originalGroupEntryHash}/info`);
              }}
            >
              <IonIcon slot="icon-only" icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {groupData ? (
          <MessageList
            groupId={groupInfo.originalGroupEntryHash}
            myAgentId={myAgentId}
            members={groupInfo!.members}
            messageIds={messages}
            chatList={chatList}
          />
        ) : (
          <IonLoading isOpen={loading} />
        )}
      </IonContent>

      <Typing profiles={typing[groupInfo.originalGroupEntryHash] ? typing[groupInfo.originalGroupEntryHash] : []}/>
      <MessageInput
        onSend={handleOnSend}
        onChange={(message) => {
          if (message.length !== 0) {
            dispatch(indicateGroupTyping({
              groupId: base64ToUint8Array(groupInfo.originalGroupEntryHash),
              indicatedBy: Buffer.from(base64ToUint8Array(myAgentId).buffer),
              members: [...groupInfo.members.map(member => 
                Buffer.from(base64ToUint8Array(member).buffer)
              ), Buffer.from(base64ToUint8Array(groupInfo.creator).buffer)],
              isTyping: true
            }))
          } else {
            dispatch(indicateGroupTyping({
              groupId: base64ToUint8Array(groupInfo.originalGroupEntryHash),
              indicatedBy: Buffer.from(base64ToUint8Array(myAgentId).buffer),
              members: [...groupInfo.members.map(member => 
                Buffer.from(base64ToUint8Array(member).buffer)
              ), Buffer.from(base64ToUint8Array(groupInfo.creator).buffer)],
              isTyping: false
            }))
          }
          return setMessage(message)
        }}
        onFileSelect={(files) => setFiles(files)}
      />
    </IonPage>
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default GroupChat;
