import renderIcon from "@holo-host/identicon";
import { deserializeHash } from "@holochain-open-dev/core-types";
import React, { useEffect, useRef } from "react";
import styles from "./style.module.css";

interface Props {
  hash: string;
  size?: number | undefined;
  shape?: "circle" | "square";
  className?: string;
}

const Identicon: React.FC<Props> = ({ hash, size = 32, className = "" }) => {
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
        className={`${styles["icon"]} ${className}`}
        id="identicon"
        width={size}
        height={size}
      />
    </div>
  );
};

export default Identicon;
