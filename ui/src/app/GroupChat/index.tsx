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
import { arrowBackSharp, informationCircleOutline } from "ionicons/icons";
import { ChatListMethods } from "../../components/Chat/types";

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
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState("");

  // Selectors
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );

  // Handlers
  const handleOnSend = () => {
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

    Promise.all(messagePromises).then((messages: GroupMessage[]) => {
      messages.forEach((msg: GroupMessage, i) => {
        groupInfo?.messages.push(msg.groupMessageEntryHash);
      })
      chatList.current!.scrollToBottom();
    })
    
  };

  const handleOnBack = () => {
    history.push({
      pathname: `/home`,
    });
  };

  // useEffects
  useEffect(() => {
    // setLoading(true);
    dispatch(fetchId()).then((res: AgentPubKey | null) => {
      if (res) setMyAgentId(Uint8ArrayToBase64(res));
    });
  }, [dispatch]);

  useEffect(() => {
    if (groupData) {
      dispatch(getLatestGroupVersion(group)).then((res: GroupConversation) => {
        setGroupInfo(res);
      });
      setLoading(false);
    } else {
      dispatch(getLatestGroupVersion(group)).then((res: GroupConversation) => {
        setGroupInfo(res);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    groupData
      ? groupData.messages
        ? setMessages(groupData.messages)
        : setMessages([])
      : setMessages([]);
  }, [groupData]);

  return !loading && groupInfo ? (
    <IonPage>
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
                    src={
                      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg"
                    }
                    alt={groupInfo!.name}
                  />
                )
              ) : (
                <img
                  src={
                    "https://upload.wikimedia.org/wikipedia/commons/8/8c/Lauren_Tsai_by_Gage_Skidmore.jpg"
                  }
                  alt={groupInfo!.name}
                />
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
            myAgentId={myAgentId}
            members={groupInfo!.members}
            messageIds={messages}
            chatList={chatList}
          ></MessageList>
        ) : (
          <IonLoading isOpen={loading} />
        )}
      </IonContent>

      <MessageInput
        onSend={() => handleOnSend()}
        onChange={(message) => setMessage(message)}
        onFileSelect={(files) => setFiles(files)}
      />
    </IonPage>
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default GroupChat;
