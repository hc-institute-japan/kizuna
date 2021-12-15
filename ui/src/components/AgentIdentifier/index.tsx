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
  noSpace?: boolean;
}

const AgentIdentifier: React.FC<Props> = ({
  nickname,
  id,
  charToShow,
  avatar = undefined,
  displayId = true,
  displayAvatar = false,
  displayNickname = true,
  noSpace = false,
}) => {
  /* trim the hash type prefix */
  const trimmedId = id.slice(5);

  const renderId = (id: string, numOfChar: number | undefined) => (
    <span className={styles["label"]}>
      {numOfChar ? id.slice(0, numOfChar).concat("...") : id}
    </span>
  );
  const renderAvatar = (id: string) => (
    <div className={styles["avatar"]}>
      <Identicon hash={id} avatar={avatar} size={50} />
    </div>
  );

  return (
    <div className={!noSpace ? styles["container"] : styles[""]}>
      {displayAvatar ? renderAvatar(id) : null}
      {displayNickname ? nickname : null}
      {displayId ? renderId(trimmedId, charToShow) : null}
    </div>
  );
};

export default AgentIdentifier;
