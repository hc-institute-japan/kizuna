import React from "react";
import styles from "./style.module.css";

interface Props {
  nickname: string;
  id: string; // base64 of AgentPubKey
  charToShow?: number; // no of characters to show in agentpubkey
  displayId?: boolean;
}

const AgentIdentifier: React.FC<Props> = ({
  nickname,
  id,
  charToShow,
  displayId = true,
}) => {
  /* trim the hash type prefix */
  const trimmedId = id.slice(5);

  const renderId = (id: string, numOfChar: number | undefined) => (
    <span className={styles["label"]}>
      {numOfChar ? id.slice(0, numOfChar).concat("...") : id}
    </span>
  );

  return (
    <>
      {nickname}
      {displayId ? renderId(trimmedId, charToShow) : null}
    </>
  );
};

export default AgentIdentifier;
