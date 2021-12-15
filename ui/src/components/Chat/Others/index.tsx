import {
  IonAvatar,
  IonItem,
  IonText,
  isPlatform,
  useIonPopover,
} from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import {
  FilePayload,
  isTextPayload,
  TextPayload,
} from "../../../redux/commons/types";
import { usePressHandlers } from "../../../utils/helpers";
import Identicon from "../../Identicon";
import ChatPopover from "../ChatPopover";
import File from "../File";
import MessageTimestamp from "../MessageTimestamp";
import ReplyTo from "../ReplyTo";
import { default as common } from "../style.module.css";
import Text from "../Text";
import { ChatProps } from "../types";

const Others: React.FC<ChatProps> = ({
  id,
  profile,
  type,
  timestamp,
  payload,
  readList,
  onSeen,
  showProfilePicture,
  showName,
  onReply,
  isPinned,
  onPinMessage,
  replyTo,
  isSeen = false,
  onDownload,
}) => {
  const intl = useIntl();

  const [show, dismiss] = useIonPopover(ChatPopover, {
    onHide: () => dismiss(),
    onPin: onPinMessage,
    onReply: () => {
      if (onReply) onReply({ author: profile.username, payload, id });
    },
    isPinned,
    intl,
  });

  // const [isModalOpen, setIsModalOpen] = useState(false);
  const onLongPress = (e: any) => {
    show({ event: e.nativeEvent });
  };
  const pressHandlers = usePressHandlers(onLongPress, () => {});

  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";
  const fileMaxWidth = isText
    ? ""
    : isPlatform("desktop")
    ? common["max-file"]
    : "";

  return (
    <>
      {isP2P ? null : showName ? (
        <IonItem lines="none" className={`${common["author-name"]}`}>
          <IonText color="medium">{profile.username}</IonText>
        </IonItem>
      ) : null}

      <IonItem
        lines="none"
        className={`${common["others-container"]} ${fileMaxWidth}`}
        {...pressHandlers}
      >
        {isP2P ? null : (
          <div className={common["picture"]} style={{ marginRight: "0.5rem" }}>
            {showProfilePicture ? (
              profile.fields.avatar ? (
                <IonAvatar className={common["avatar-container"]}>
                  <img src={profile.fields.avatar} alt="avatar"></img>
                </IonAvatar>
              ) : (
                <Identicon hash={profile.id!} size={35} />
              )
            ) : null}
          </div>
        )}

        <div
          className={`${common["others"]} ${common[isText ? "text" : "file"]} ${
            common.bubble
          }`}
        >
          {replyTo ? <ReplyTo me={false} message={replyTo}></ReplyTo> : null}
          {isText ? (
            <Text type="others" message={payload as TextPayload} />
          ) : (
            <File
              chatType={isP2P ? "p2p" : "group"}
              onDownload={onDownload}
              type="others"
              file={payload as FilePayload}
              timestamp={timestamp}
            />
          )}
          <MessageTimestamp onSeen={onSeen} timestamp={timestamp} />
        </div>
      </IonItem>
      {/* <ChatModal
        onPin={onPinMessage as () => any}
        isPinned={isPinned}
        onReply={() => {
          if (onReply) onReply({ author, payload, id });
        }}
        open={[isModalOpen, setIsModalOpen]}
      ></ChatModal> */}
    </>
  );
};

export default Others;
