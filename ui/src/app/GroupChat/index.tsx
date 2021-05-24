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
import { arrowBackSharp, informationCircleOutline, peopleCircleOutline } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";

// Redux
import { FilePayloadInput } from "../../redux/commons/types";
import { getLatestGroupVersion, indicateGroupTyping, sendGroupMessage } from "../../redux/group/actions";
import { GroupConversation, GroupMessage, GroupMessageInput } from "../../redux/group/types";
import { fetchId } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";

// Components
import { ChatListMethods } from "../../components/Chat/types";
import Typing from "../../components/Chat/Typing";
import MessageInput from "../../components/MessageInput";
import MessageList from "./MessageList";

import { base64ToUint8Array, Uint8ArrayToBase64, useAppDispatch } from "../../utils/helpers";
import styles from "./style.module.css";

interface GroupChatParams {
  group: string;
}

const GroupChat: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { group } = useParams<GroupChatParams>();
  const chatList = useRef<ChatListMethods>(null);

  // local states
  const [myAgentId, setMyAgentId] = useState<string>("");
  const [files, setFiles] = useState<object[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupConversation | undefined>();
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingLoading, setSendingLoading] = useState<boolean>(false);
  const [message, setMessage] = useState("");

  /* Selectors */
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );

  const typing = useSelector((state: RootState) => state.groups.typing);

  /* Handlers */
  const handleOnSend = () => {
    let inputs: GroupMessageInput[] = [];
    if (files.length) {
      setSendingLoading(true);
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

  const handleOnBack = () => history.push({pathname: `/home`});

  const handleOnChange = (message: string, groupInfo: GroupConversation) => {
    dispatch(fetchId()).then((myAgentId: AgentPubKey | null) => {
      let myAgentIdBase64 = Uint8ArrayToBase64(myAgentId!); // AgentPubKey should be non-nullable here

      // Remove self from the recipient of typing signal
      let members = [...groupInfo.members, groupInfo.creator]
        .filter(member => member !== myAgentIdBase64)
        .map(member => Buffer.from(base64ToUint8Array(member).buffer));

      dispatch(
        indicateGroupTyping({
          groupId: base64ToUint8Array(groupInfo.originalGroupEntryHash),
          indicatedBy: myAgentId!,
          members,
          isTyping: (message.length !== 0) ? true : false,
        })
      );
    })
    return setMessage(message);
  }

  /* UseEffects */
  useEffect(() => {
    dispatch(fetchId()).then((res: AgentPubKey | null) => {
      if (res) setMyAgentId(Uint8ArrayToBase64(res));
    });
  }, [dispatch]);

  useEffect(() => {
    if (groupData) {
      setGroupInfo(groupData);
      setLoading(false);
    } else {
      dispatch(getLatestGroupVersion(group)).then((res: GroupConversation) => {
        setGroupInfo(res);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupData]);

  useEffect(() => {
    setLoading(true);
    if (groupData && groupData.messages.length) {
      let newMessages = [...messages!, ...groupData.messages];
      setMessages(newMessages);
      setLoading(false);
    } else {
      dispatch(getLatestGroupVersion(group)).then((res: GroupConversation) => {
        setMessages([...messages!, ...res.messages]);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupData]);

  return !loading && groupInfo && messages ? (
    <IonPage>
      <IonLoading
        isOpen={sendingLoading}
        message={intl.formatMessage({
          id: "app.group-chat.sending",
        })}
      />
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton onClick={() => handleOnBack()} className="ion-no-padding">
              <IonIcon slot="icon-only" icon={arrowBackSharp} />
            </IonButton>
            <IonAvatar className="ion-padding">
              <img src={peopleCircleOutline} alt={groupInfo!.name} />
              {/* TODO: proper picture for default avatar if none is set */}
              {/* TODO: Display an actual avatar set by the group creator */}
              {/* {groupInfo ? (
                groupInfo!.avatar ? (
                  <img src={groupInfo!.avatar} alt={groupInfo!.name} />
                ) : (
                  <img src={peopleCircleOutline} color="white" alt={groupInfo!.name} />
                )
              ) : (
                <img src={peopleCircleOutline} alt={groupInfo!.name} />
              )} */}
            </IonAvatar>
            <IonTitle className={styles["title"]}>
              <div className="item item-text-wrap">{groupInfo!.name}</div>
            </IonTitle>
            <IonButton onClick={() => history.push(`/g/${groupInfo.originalGroupEntryHash}/info`)}>
              <IonIcon slot="icon-only" icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {groupData ? (
          <MessageList
            groupId={groupInfo.originalGroupEntryHash}
            members={groupInfo!.members}
            messageIds={messages}
            chatList={chatList}
          />
        ) : (
          <IonLoading isOpen={loading} />
        )}
      </IonContent>

      <Typing
        profiles={
          typing[groupInfo.originalGroupEntryHash]
            ? typing[groupInfo.originalGroupEntryHash]
            : []
        }
      />
      <MessageInput
        onSend={handleOnSend}
        onChange={(message: string) => handleOnChange(message, groupInfo)}
        onFileSelect={(files) => setFiles(files)}
      />
    </IonPage>
  ) : (
    <IonLoading isOpen={loading} />
  );
};

export default GroupChat;
