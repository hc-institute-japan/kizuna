import { IonAvatar, IonImg, IonItem } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import { isBuffer } from "util";
import { Profile } from "../../../redux/profile/types";
import Others from "../Others";
import styles from "./style.module.css";

interface Props {
  profiles: Profile[];
}

const Typing: React.FC<Props> = ({ profiles }) => {
  const intl = useIntl();

  const others = (remaining: Profile[]) => {
    switch (remaining.length) {
      case 0:
        return null;
      case 1:
        return remaining[0].username;
      default:
        return <span>, {remaining.length} others </span>;
    }
  };

  const animateDots = () => {
    return [".", ".", "."].map((dot, i) => (
      <span style={{ animationDelay: `${0.3 * i}s` }} className={styles.dot}>
        {dot}
      </span>
    ));
  };

  const displayNames = (profiles: Profile[]) => {
    const limit = 3;
    if (profiles.length === 1)
      return (
        intl.formatMessage(
          {
            id: "components.typing.is-typing",
          },
          { user: profiles[0].username }
        ) + animateDots()
      );
    const names = `${profiles
      .slice(0, limit - 1)
      .map((profile) => profile.username)
      .join(", ")}`;
    const remaining = profiles.slice(limit - 1, profiles.length);

    return (
      <span>
        {names}
        {others(remaining)} are typing{animateDots()}
      </span>
    );
  };
  return (
    <div className={`${styles.typing} ion-padding-start`}>
      {displayNames(profiles)}
    </div>
  );
};

export default Typing;
