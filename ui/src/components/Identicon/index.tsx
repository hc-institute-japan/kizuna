import renderIcon from "@holo-host/identicon";
import { deserializeHash } from "@holochain-open-dev/core-types";
import { IonAvatar, IonIcon, IonImg } from "@ionic/react";
import { personCircle, personCircleOutline } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import styles from "./style.module.css";

interface Props {
  hash: string;
  size?: number | undefined;
  avatar?: string;
  shape?: "circle" | "square";
  className?: string;
}

const Identicon: React.FC<Props> = ({
  hash,
  size = 32,
  className = "",
  avatar = undefined,
}) => {
  // const canvas = document.getElementById(styles.icon) as HTMLCanvasElement;
  const canvas = useRef<HTMLCanvasElement>(null);
  const opts = {
    hash: deserializeHash(hash),
    size,
  };
  useEffect(() => {
    if (canvas.current) renderIcon(opts, canvas.current);
  });
  return (
    <div>
      {!avatar ? (
        // <canvas
        //   ref={canvas}
        //   className={`${styles["icon"]} ${className}`}
        //   id="identicon"
        //   width={size}
        //   height={size}
        // />
        // <IonAvatar className={styles["avatar"]}>
        <IonImg
          src="assets/icon/person-circle-outline.svg"
          alt="avatar"
          className={`${styles["icon"]} ${className}`}
        />
      ) : (
        // </IonAvatar>
        <IonAvatar className={styles["avatar"]}>
          <img src={avatar} alt="avatar"></img>
        </IonAvatar>
      )}
    </div>
  );
};

export default Identicon;
