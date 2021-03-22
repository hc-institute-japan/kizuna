import { IonText } from "@ionic/react";
import React, { ReactElement } from "react";
import Me from "./components/Me";
import Others from "./components/Others";
import Space from "./components/Space";
import styles from "./style.module.css";
import { ChatListProps } from "./types";

const ChatList: React.FC<ChatListProps> = ({
  children,
  type = "p2p",
  author,
}) => {
  const arrChildren = React.Children.toArray(children);
  const assess = (
    child: React.ReactElement,
    arrChildren: React.ReactElement[],
    i: number
  ) => {
    let showProfilePicture = false;
    let space = false;
    let showName = false;
    let isMyName = author === child.props.author;
    if (i === 0) {
      showProfilePicture = true;
    }
    const prevChild = arrChildren[i - 1];
    if (child?.props?.author !== prevChild?.props?.author) {
      showProfilePicture = true;
      space = true;
    }

    showName = showProfilePicture;
    return { showProfilePicture, space, showName, isMyName };
  };
  return (
    <div className={`${styles.chat} ion-padding`}>
      {React.Children.map(arrChildren, (child, i) => {
        if (React.isValidElement(child)) {
          const { showProfilePicture, space, showName, isMyName } = assess(
            child,
            arrChildren as React.ReactElement[],
            i
          );
          return (
            <>
              {space ? <Space /> : null}
              {showName ? (
                <>
                  <IonText
                    className={`${
                      isMyName ? "ion-text-end" : "ion-text-start"
                    }`}
                  >
                    {child.props.author}
                  </IonText>
                  <Space />
                </>
              ) : null}
              {React.cloneElement(child, {
                type,
                showProfilePicture,
              })}
            </>
          );
        }
        return child;
      })}
    </div>
  );
};

export default ChatList;
