import React from "react";
import Identicon from "../Identicon";
import styles from "./style.module.css";

interface Props {
  nickname: string;
  id: string; // base64 of AgentPubKey
  charToShow?: number; // no of characters to show in agentpubkey
  avatar?: string;
  displayId?: boolean;
  displayAvatar?: boolean;
  displayNickname?: boolean;
}

const AgentIdentifier: React.FC<Props> = ({
  nickname,
  id,
  charToShow,
  avatar = undefined,
  displayId = true,
  displayAvatar = false,
  displayNickname = true,
}) => {
  /* trim the hash type prefix */
  const trimmedId = id.slice(5);

  const renderId = (id: string, numOfChar: number | undefined) => (
    <span className={styles["label"]}>
      {numOfChar ? id.slice(0, numOfChar).concat("...") : id}
    </span>
  );
  const renderAvatar = (id: string) => (
    <span className={styles["avatar"]}>
      <Identicon hash={id} avatar={avatar} />
    </span>
  );

  return (
    <>
      {displayAvatar ? renderAvatar(id) : null}
      {displayNickname ? nickname : null}
      {displayId ? renderId(trimmedId, charToShow) : null}
    </>
  );
};

export default AgentIdentifier;
