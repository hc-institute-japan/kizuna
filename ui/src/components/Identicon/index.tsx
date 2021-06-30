import renderIcon from "@holo-host/identicon";
import { deserializeHash } from "@holochain-open-dev/core-types";
import React, { useEffect, useRef } from "react";
import styles from "./style.module.css";

interface Props {
  hash: string;
  size?: number | undefined;
  shape?: "circle" | "square";
}

const Identicon: React.FC<Props> = ({ hash, size = 32 }) => {
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
      <canvas
        ref={canvas}
        className={styles["icon"]}
        id="identicon"
        width="20"
        height="20"
      />
    </div>
  );
};

export default Identicon;
