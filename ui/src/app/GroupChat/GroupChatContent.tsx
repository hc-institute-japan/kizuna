import { IonContent, IonLoading, IonPage } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
// Components
import { ChatListMethods } from "../../components/Chat/types";
import Typing from "../../components/Chat/Typing";
import MessageInput, {
  MessageInputMethods,
  MessageInputOnSendParams,
} from "../../components/MessageInput";
// Redux
import { FilePayloadInput } from "../../redux/commons/types";
import {
  indicateGroupTyping,
  sendGroupMessage,
} from "../../redux/group/actions";
import { fetchPinnedMessages } from "../../redux/group/actions/fetchPinnedMessages";
import {
  GroupConversation,
  GroupMessage,
  GroupMessageInput,
} from "../../redux/group/types";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import ChatBox from "./ChatBox";
import GroupChatHeader from "./GroupChatHeader";

interface GroupChatParams {
  group: string;
}

const GroupChat: React.FC = () => {
  const dispatch = useAppDispatch();
  const { group } = useParams<GroupChatParams>();

  /* local states */
  const [files, setFiles] = useState<object[]>([]);
  const [message, setMessage] = useState("");

  /* Refs */
  const chatList = useRef<ChatListMethods>(null);
  const inputTimeout = useRef<NodeJS.Timeout>();

  /* Selectors */
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );

  const myProfile = useSelector((state: RootState) => state.profile);
  const typing = useSelector((state: RootState) => state.groups.typing);
  const { readReceipt, typingIndicator } = useSelector(
    (state: RootState) => state.preference
  );

  /**
   * Hooks
   */

  useEffect(() => {
    if (groupData) dispatch(fetchPinnedMessages(groupData?.originalGroupId));
  }, [groupData, dispatch]);

  /* Handlers */

  /* handles sending of messages. */
  const handleOnSend = (opt?: MessageInputOnSendParams) => {
    const { reply, setIsLoading } = { ...opt };
    let inputs: GroupMessageInput[] = [];
    setIsLoading!(true);
    /*
      append text payload at index 0 and send it first
      for performance purposes
    */
    if (message.length) {
      inputs.push({
        groupId: groupData!.originalGroupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: message },
        },
        sender: myProfile.id!,
        // TODO: handle replying to message here as well
        replyTo: reply,
      });
    }

    if (files.length) {
      files.forEach((file: any) => {
        const filePayloadInput: FilePayloadInput = {
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
        const groupMessage: GroupMessageInput = {
          /* groupData is non-nullable once the page renders */
          groupId: groupData!.originalGroupId,
          payloadInput: filePayloadInput,
          sender: myProfile.id!,
          // TODO: handle replying to message here as well
          replyTo: reply,
        };
        inputs.push(groupMessage);
      });
    }

    const messagePromises = inputs.map((groupMessage: GroupMessageInput) =>
      dispatch(sendGroupMessage(groupMessage))
    );

    Promise.all(messagePromises).then((sentMessages: GroupMessage[]) => {
      setIsLoading!(false);
      chatList.current!.scrollToBottom();
    });
  };

  /* 
      handle change in message input. indicate typing as the user types 
      but debounce with 500ms to indicate false in
    */
  const handleOnChange = (message: string, groupInfo: GroupConversation) => {
    if (typingIndicator) {
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
        500
      );
    }
    return setMessage(message);
  };

  // const pinnedMessages = groupData.pinnedMessages?.map(pinnedMessage=>)

  const messageInput = useRef<MessageInputMethods | null>(null);

  return groupData ? (
    <IonPage>
      <GroupChatHeader groupData={groupData} />
      <IonContent>
        {/* <PinnedMessage></PinnedMessage> */}
        <ChatBox
          onReply={(message) => {
            if (messageInput.current) messageInput?.current?.reply(message);
          }}
          groupId={groupData.originalGroupId}
          members={[...groupData.members, groupData.creator]}
          messageIds={groupData.messages}
          chatList={chatList}
          readReceipt={readReceipt}
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
        ref={messageInput}
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
