import {
  IonAvatar,
  IonIcon,
  IonItem,
  IonText,
  isPlatform,
  useIonPopover,
} from "@ionic/react";
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  checkmarkDoneCircle,
  radioButtonOff,
} from "ionicons/icons";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import {
  FilePayload,
  isTextPayload,
  TextPayload,
} from "../../../redux/commons/types";
import { usePressHandlers } from "../../../utils/helpers";
import Identicon from "../../Identicon";
import Spinner from "../../Spinner";
import ChatPopover from "../ChatPopover";
import File from "../File";
import ReplyTo from "../ReplyTo";
import { default as common, default as styles } from "../style.module.css";
import Text from "../Text";
import { ChatProps } from "../types";

const Me: React.FC<ChatProps> = ({
  id,
  profile,
  payload,
  timestamp,
  replyTo,
  onReply,
  onDelete,
  onPinMessage,
  isPinned,
  type,
  showProfilePicture,
  isSeen = false,
  onDownload,
  onRetry,
  err,
}) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const onLongPress = (e: any) =>
    present({
      event: e.nativeEvent,
    });
  const [present, dismiss] = useIonPopover(ChatPopover, {
    onHide: () => dismiss(),
    onPin: onPinMessage,
    onReply: () => {
      if (onReply) onReply({ author: profile.username, payload, id });
    },
    onDelete: () => {
      if (onDelete) onDelete();
    },
    onRetry: () => {
      if (onRetry) onRetry(setLoading);
    },
    isPinned,
    intl,
    err,
  });

  // const [isModalOpen, setIsModalOpen] = useState(false);
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
      <IonItem
        lines="none"
        className={`${common["me-container"]} ${fileMaxWidth}`}
        onClick={(e: any) => (err ? onLongPress(e) : null)}
        {...pressHandlers}
      >
        <div
          className={`${common["me"]} ${common[isText ? "text" : "file"]} ${
            common.bubble
          }`}
        >
          {replyTo ? <ReplyTo me={true} message={replyTo}></ReplyTo> : null}
          {isText ? (
            <Text type="me" message={payload as TextPayload} />
          ) : (
            <File
              chatType={isP2P ? "p2p" : "group"}
              onDownload={onDownload}
              type="me"
              timestamp={timestamp}
              file={payload as FilePayload}
              err={err}
            />
          )}
          <IonText>
            <h6
              className={`ion-no-margin ion-text-end ${styles["message-text"]}`}
            >
              {intl.formatTime(timestamp)}
              <IonIcon
                size="medium"
                icon={
                  isSeen
                    ? checkmarkDoneCircle
                    : err && id !== "error message"
                    ? radioButtonOff
                    : checkmarkCircleOutline
                }
              />
            </h6>
          </IonText>
        </div>
        {err && id === "error message" ? (
          loading ? (
            <div className={common.picture}>
              <Spinner />
            </div>
          ) : (
            <IonIcon
              color="danger"
              className={common.picture}
              style={{ marginLeft: "0.5rem" }}
              icon={alertCircleOutline}
            ></IonIcon>
          )
        ) : isP2P ? null : (
          <div className={common["picture"]} style={{ marginLeft: "0.5rem" }}>
            {showProfilePicture ? (
              profile.fields.avatar ? (
                <IonAvatar className={common["avatar-container"]}>
                  <img src={profile.fields.avatar} alt="avatar"></img>
                </IonAvatar>
              ) : (
                <IonAvatar className={common["avatar-container"]}>
                  <Identicon hash={profile.id!} size={35} />
                </IonAvatar>
              )
            ) : null}
          </div>
        )}
      </IonItem>
      {err && id === "error message" ? (
        loading ? null : (
          <IonItem lines="none" className={styles["not-delivered-container"]}>
            <IonText className={styles["not-delivered"]} color="danger">
              Not delivered
            </IonText>
          </IonItem>
        )
      ) : null}
      {/* <ChatModal
        isPinned={isPinned}
        onPin={onPinMessage as () => any}
        onReply={() => {
          if (onReply) onReply({ author, payload, id });
        }}
        open={[isModalOpen, setIsModalOpen]}
      ></ChatModal> */}
    </>
  );
};

export default Me;
