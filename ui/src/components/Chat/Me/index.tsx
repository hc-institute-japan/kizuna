import React from "react";
import {
  FilePayload,
  isTextPayload,
  TextPayload,
} from "../../../redux/commons/types";
import File from "../File";
import common from "../style.module.css";
import Text from "../Text";
import { ChatProps } from "../types";

const Me: React.FC<ChatProps> = ({
  payload,
  author,
  timestamp,
  readList,
  type,
  showProfilePicture,
}) => {
  const isText = isTextPayload(payload);
  const isP2P = type === "p2p";

  return (
    <div className={common["me-container"]}>
      {isText ? (
        <Text
          type="me"
          message={payload as TextPayload}
          timestamp={timestamp}
        />
      ) : (
        <File type="me" timestamp={timestamp} file={payload as FilePayload} />
      )}
      {isP2P ? null : (
        <div className={common.picture} style={{ marginLeft: "0.5rem" }}>
          {showProfilePicture ? (
            <img
              alt={`${author}'s profile`}
              src="https://instagram.fmnl4-4.fna.fbcdn.net/v/t51.2885-15/e35/s1080x1080/163528151_952829552157741_3965471732380754680_n.jpg?tp=1&_nc_ht=instagram.fmnl4-4.fna.fbcdn.net&_nc_cat=109&_nc_ohc=J_UMfyNh00IAX_eoD0Z&ccb=7-4&oh=52c4031bd9c5cb1dfc9211af018e4d95&oe=607F179B&_nc_sid=86f79a"
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Me;
