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
import {
  arrowBackSharp,
  informationCircleOutline,
  peopleCircleOutline,
} from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
// Components
import { ChatListMethods } from "../../components/Chat/types";
import Typing from "../../components/Chat/Typing";
import MessageInput from "../../components/MessageInput";
// Redux
import { FilePayloadInput } from "../../redux/commons/types";
import { indicateGroupTyping } from "../../redux/group/actions/indicateGroupTyping";
import { sendGroupMessage } from "../../redux/group/actions/sendGroupMessage";
import {
  GroupConversation,
  GroupMessage,
  GroupMessageInput,
} from "../../redux/group/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import ChatBox from "./ChatBox";
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

  /* local states */
  const [files, setFiles] = useState<object[]>([]);
  const [sendingLoading, setSendingLoading] = useState<boolean>(false);
  const [message, setMessage] = useState("");

  /* Refs */
  const didMountRef = useRef(false);

  /* Selectors */
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );
  const myProfile = useSelector((state: RootState) => state.profile);
  const typing = useSelector((state: RootState) => state.groups.typing);

  /* Handlers */

  /* handles sending of messages. */
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
          /* groupData is non-nullable once the page renders */
          groupId: groupData!.originalGroupId,
          payloadInput: filePayloadInput,
          sender: myProfile.id!,
          // TODO: handle replying to message here as well
          replyTo: undefined,
        };
        inputs.push(groupMessage);
      });
    }
    if (message.length) {
      inputs.push({
        groupId: groupData!.originalGroupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: message },
        },
        sender: myProfile.id!,
        // TODO: handle replying to message here as well
        replyTo: undefined,
      });
    }

    const messagePromises = inputs.map((groupMessage: any) =>
      // TODO: error handling
      dispatch(sendGroupMessage(groupMessage))
    );

    Promise.all(messagePromises).then((sentMessages: GroupMessage[]) => {
      // sentMessages.forEach((msg: GroupMessage, i) => {
      //   setMessages([...messages!, msg.groupMessageId]);
      // });
      setSendingLoading(false);
      chatList.current!.scrollToBottom();
    });
  };

  const handleOnBack = () => history.push({ pathname: `/home` });

  const inputTimeout = useRef<NodeJS.Timeout>();

  const handleOnChange = (message: string, groupInfo: GroupConversation) => {
    // Remove self from the recipient of typing signal
    let members = [...groupInfo.members, groupInfo.creator].filter(
      (member) => member !== myProfile.id
    );

    dispatch(
      indicateGroupTyping({
        groupId: groupInfo.originalGroupId,
        indicatedBy: myProfile.id!,
        members,
        isTyping: message.length !== 0 ? true : false,
      })
    );

    if (inputTimeout.current) clearTimeout(inputTimeout.current);

    inputTimeout.current = setTimeout(
      () =>
        dispatch(
          indicateGroupTyping({
            groupId: groupInfo.originalGroupId,
            indicatedBy: myProfile.id!,
            members,
            isTyping: false,
          })
        ),
      5000
    );

    return setMessage(message);
  };

  /* Effects */
  useEffect(() => {
    if (didMountRef.current) {
      let members = [...groupData.members, groupData.creator].filter(
        (member) => member !== myProfile.id
      );

      dispatch(
        indicateGroupTyping({
          groupId: groupData.originalGroupId,
          indicatedBy: myProfile.id!,
          members,
          isTyping: true,
        })
      );
    } else {
      didMountRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return groupData ? (
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
            <IonButton
              onClick={() => handleOnBack()}
              className="ion-no-padding"
            >
              <IonIcon slot="icon-only" icon={arrowBackSharp} />
            </IonButton>
            <IonAvatar className="ion-padding">
              {/* TODO: proper picture for default avatar if none is set */}
              {/* TODO: Display an actual avatar set by the group creator */}
              <img src={peopleCircleOutline} alt={groupData!.name} />
            </IonAvatar>
            <IonTitle className={styles["title"]}>
              <div className="item item-text-wrap">{groupData!.name}</div>
            </IonTitle>
            <IonButton
              onClick={() =>
                history.push(`/g/${groupData.originalGroupId}/info`)
              }
            >
              <IonIcon slot="icon-only" icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ChatBox
          groupId={groupData.originalGroupId}
          members={groupData.members}
          messageIds={groupData.messages}
          chatList={chatList}
        />
      </IonContent>

      <Typing
        profiles={
          typing[groupData.originalGroupId]
            ? typing[groupData.originalGroupId]
            : []
        }
      />
      <MessageInput
        onSend={handleOnSend}
        onChange={(message: string) => handleOnChange(message, groupData)}
        onFileSelect={(files) => setFiles(files)}
      />
    </IonPage>
  ) : (
    <IonLoading isOpen={true} />
  );
};

export default GroupChat;
