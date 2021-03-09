import {
  IonAvatar,
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useParams } from "react-router";
import { Conversation } from "../../utils/types";
import styles from "./style.module.css";

type Props = {
  location: RouteComponentProps<{}, {}, { state: Conversation }>;
};

const Chat: React.FC<Props> = ({ location }) => {
  const { username } = useParams<{ username: string }>();
  // const { username: me } = useSelector((state: RootState) => state.profile)
  const [data, setData] = useState<Conversation | null>(null);
  useEffect(() => {
    const { state }: any = { ...location };
    if (state) {
      setData(state);
    } else {
    }
  }, [location]);

  // const { messages }: { messages?: Message[] } = { ...data };

  // const handleMessage = (message: Message) => {
  //   const Message = me === message.sender ? Me : Others;
  //   return <Message message={message} />;
  // };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" className="ion-no-padding" />
            <IonAvatar className="ion-padding">
              {data ? <img src={data?.src} alt={username} /> : <IonSpinner />}
            </IonAvatar>
          </IonButtons>
          <IonTitle className="ion-no-padding"> {username}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {data ? (
          <div className={`${styles.chat} ion-padding`}>
            {/* {messages?.map(handleMessage)} */}
          </div>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default Chat;
