import { IonContent, IonPage } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
// Components
import { ChatListMethods } from "../../components/Chat/types";
import Typing from "../../components/Chat/Typing";
import MessageInput, {
  FileContent,
  MessageInputMethods,
  MessageInputOnSendParams,
} from "../../components/MessageInput";
// Redux
import { FilePayloadInput } from "../../redux/commons/types";
import {
  indicateGroupTyping,
  sendGroupMessage,
  setErrGroupMessage,
} from "../../redux/group/actions";
import { fetchPinnedMessages } from "../../redux/group/actions/fetchPinnedMessages";
import { GroupConversation, GroupMessageInput } from "../../redux/group/types";
import { RootState } from "../../redux/types";
// Utils
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
  const [files, setFiles] = useState<FileContent[]>([]);
  const [message, setMessage] = useState("");

  /* Refs */
  const chatList = useRef<ChatListMethods>(null);
  const inputTimeout = useRef<NodeJS.Timeout>();
  const messageInput = useRef<MessageInputMethods | null>(null);

  /* Selectors */
  const groupData = useSelector(
    (state: RootState) => state.groups.conversations[group]
  );

  const myProfile = useSelector((state: RootState) => state.profile);
  const typing = useSelector((state: RootState) => state.groups.typing);
  const { readReceipt, typingIndicator } = useSelector(
    (state: RootState) => state.preference
  );

  /* Hooks */

  useEffect(() => {
    if (groupData) dispatch(fetchPinnedMessages(groupData?.originalGroupId));
  }, [groupData, dispatch]);

  /* Handlers */

  /* handles sending of messages. */
  const handleOnSend = (opt?: MessageInputOnSendParams) => {
    const { message: message2, reply, setIsLoading } = { ...opt };
    let text: GroupMessageInput | null = null;
    let file: GroupMessageInput | null = null;
    setIsLoading!(true);
    /*
      append text payload at index 0 and send it first
      for performance purposes
    */
    if (message2!.length) {
      text = {
        groupId: groupData!.originalGroupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: message2! },
        },
        sender: myProfile.id!,
        // TODO: handle replying to message here as well
        replyTo: reply,
      };
    }

    if (files.length) {
      // TODO: change when uploading of multiple files is allowed
      const filePayload: any = files[0];
      const filePayloadInput: FilePayloadInput = {
        type: "FILE",
        payload: {
          metadata: {
            fileName: filePayload.metadata.fileName,
            fileSize: filePayload.metadata.fileSize,
            fileType: filePayload.metadata.fileType,
          },
          fileType: filePayload.fileType,
          fileBytes: filePayload.fileBytes,
        },
      };
      file = {
        /* groupData is non-nullable once the page renders */
        groupId: groupData!.originalGroupId,
        payloadInput: filePayloadInput,
        sender: myProfile.id!,
        // TODO: handle replying to message here as well
        replyTo: reply,
      };
    }

    if (text) {
      dispatch(sendGroupMessage(text)).then((res: any) => {
        if (res === false) dispatch(setErrGroupMessage(text!));
        if (file) {
          dispatch(sendGroupMessage(file)).then((res: any) => {
            if (!res) dispatch(setErrGroupMessage(file!));
            setIsLoading!(false);
            chatList.current!.scrollToBottom();
          });
        }
        setIsLoading!(false);
        chatList.current!.scrollToBottom();
      });
    } else if (file) {
      dispatch(sendGroupMessage(file)).then((res: any) => {
        if (!res) dispatch(setErrGroupMessage(file!));
        setIsLoading!(false);
        chatList.current!.scrollToBottom();
      });
    }
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
  ) : null;
};

export default GroupChat;
