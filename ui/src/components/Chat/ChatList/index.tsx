import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonText,
} from "@ionic/react";
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  Fragment,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";
import { ChatListMethods, ChatListProps } from "../types";

const ChatList: ForwardRefRenderFunction<ChatListMethods, ChatListProps> = (
  { children, type = "p2p", onScrollTop, disabled },
  ref: Ref<ChatListMethods>
) => {
  const arrChildren = React.Children.toArray(children);
  const intl = useIntl();
  const scroll = useRef<HTMLDivElement | null>(null);
  const infiniteScroll = useRef<HTMLIonInfiniteScrollElement>(null);
  const assess = (
    child: React.ReactElement,
    arrChildren: React.ReactElement[],
    i: number
  ) => {
    let showProfilePicture = false;
    let space = false;
    let showName = false;
    let showDate = i === 0;

    const hasRead =
      Object.values(arrChildren[i]?.props?.readList)?.length !== 0;

    if (i === 0) showProfilePicture = true;

    const prevChild = arrChildren[i - 1];
    const props = child?.props;
    const prevChildProps = prevChild?.props;
    if (props?.author !== prevChildProps?.author) {
      showProfilePicture = true;
      space = true;
    }
    const timestamp: Date = props?.timestamp;
    const prevTimestamp: Date = prevChildProps?.timestamp;
    if (timestamp && prevTimestamp) {
      showDate = !(
        timestamp.getDate() === prevTimestamp.getDate() &&
        timestamp.getMonth() === prevTimestamp.getMonth() &&
        timestamp.getFullYear() === prevTimestamp.getFullYear()
      );
      if (showDate) showProfilePicture = true;
    }
    if (type === "group") showName = showProfilePicture;

    return { showProfilePicture, space, showName, showDate, hasRead };
  };

  const elements = React.Children.map(arrChildren, (child, i) => {
    if (React.isValidElement(child)) {
      const { showProfilePicture, showName, showDate, hasRead } = assess(
        child,
        arrChildren as React.ReactElement[],
        i
      );

      return (
        <Fragment key={i}>
          {showDate ? (
            <IonText className="ion-text-center">
              {child.props.timestamp.toDateString() ===
              new Date().toDateString()
                ? intl.formatMessage({ id: "components.chat.chat-list.today" })
                : intl.formatDate(child.props.timestamp, {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  })}
            </IonText>
          ) : null}
          {React.cloneElement(child, {
            isSeen: hasRead,
            type,
            showProfilePicture,
            showName,
          })}
        </Fragment>
      );
    }
    return child;
  });

  useEffect(() => {
    if (scroll.current) {
      setTimeout(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [scroll]);

  const complete: () => any = () => infiniteScroll.current?.complete();

  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      /* TODO: come up with a better implementation than simply setting a timeout for scrollIntoView */
      setTimeout(
        () => scroll.current?.scrollIntoView({ behavior: "smooth" }),
        500
      );
    },
  }));

  return (
    <IonList className={`${styles.chat} chat-list`}>
      {onScrollTop ? (
        <IonInfiniteScroll
          disabled={disabled ? true : false}
          threshold="0px"
          ref={infiniteScroll}
          position="top"
          /* Adding a 1 second timeout just because messages are being fetched too freakin' fast locally :D */
          onIonInfinite={(e) =>
            setTimeout(() => onScrollTop(complete, e), 1000)
          }
        >
          <IonInfiniteScrollContent loadingSpinner="crescent" />
        </IonInfiniteScroll>
      ) : null}

      {elements}
      <div ref={scroll} />
    </IonList>
  );
};

export default forwardRef(ChatList);
