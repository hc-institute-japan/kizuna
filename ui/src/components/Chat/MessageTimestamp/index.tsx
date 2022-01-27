import { IonText } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

interface Props {
  timestamp: Date;
  onSeen?(complete: () => any): any;
}

const MessageTimestamp: React.FC<Props> = ({ timestamp, onSeen }) => {
  const intl = useIntl();
  const observerStorage = useRef<IntersectionObserver>();
  const ref = useRef<HTMLIonTextElement>(null);

  const options = {
    root: document.querySelector(".chat-list"),
    rootMargin: "0px",
    threshold: 1,
  };

  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    observerStorage.current?.disconnect();
    observerStorage.current = new IntersectionObserver(() => {
      if (onSeen) {
        if (!isComplete) {
          setIsComplete(true);
          onSeen(complete);
        }
      }
    }, options);
    if (ref.current) observerStorage.current?.observe(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, ref.current]);

  const complete = () => {
    if (isComplete) setIsComplete(false);
  };

  return (
    <IonText ref={ref}>
      <h6 className={`ion-no-margin ion-text-end ${styles["message-text"]}`}>
        {intl.formatTime(timestamp)}
      </h6>
    </IonText>
  );
};

export default MessageTimestamp;
