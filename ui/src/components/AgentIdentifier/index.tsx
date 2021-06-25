import React from "react";
import styles from "./style.module.css";

interface Props {
  nickname: string;
  id: string; // base64 of AgentPubKey
  charToShow?: number; // no of characters to show in agentpubkey
}

const AgentIdentifier: React.FC<Props> = ({ nickname, id, charToShow }) => {
  /* trim the hash type prefix */
  const trimmedId = id.slice(5);

  const renderId = (id: string, numOfChar: number | undefined) => (
    <span className={styles["label"]}>
      {numOfChar ? id.slice(0, numOfChar).concat("...") : id}
    </span>
  );

  return (
    <div>
      {nickname}
      {renderId(trimmedId, charToShow)}
    </div>
  );
};

export default AgentIdentifier;
