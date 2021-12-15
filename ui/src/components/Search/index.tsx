import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import { arrowBackOutline, arrowBackSharp, calendar } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Payload, ReplyTo } from "../../redux/commons/types";
import { Profile } from "../../redux/profile/types";
import { RootState } from "../../redux/types";
import { ChatList, Me, Others } from "../Chat";
import DatePicker, { DatePickerMethods } from "../DatePicker";
import styles from "./style.module.css";

interface Props {
  prevHref: string;
  onDateSelect?(date: Date): any;
  type: "group" | "p2p";
  messages?: any[];
}

const Search: React.FC<Props> = ({
  type,
  prevHref,
  onDateSelect,
  messages,
}) => {
  const datePicker = useRef<DatePickerMethods>(null);
  const [msgs, setMsgs] = useState<
    | {
        id: string;
        author: Profile;
        payload: Payload;
        timestamp: Date;
        readList: any;
        replyTo?: ReplyTo;
      }[]
    | null
  >(null);
  const history = useHistory();

  useEffect(() => {
    if (messages) {
      setMsgs(messages);
    }
  }, [messages]);

  const profile = useSelector((state: RootState) => state.profile);

  const handleSearchByDate = () => {
    datePicker.current?.open();
  };

  const handleOnDownload = () => {};

  return (
    <IonPage>
      {!msgs ? (
        <>
          <IonHeader>
            <IonToolbar>
              <IonButtons>
                <IonButton
                  onClick={() => history.push({ pathname: prevHref })}
                  className="ion-no-padding"
                >
                  <IonIcon slot="icon-only" icon={arrowBackSharp} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList className={styles.search}>
              <IonItem lines="full" button onClick={handleSearchByDate}>
                <IonIcon slot="start" icon={calendar}></IonIcon>
                <IonLabel>Search by date</IonLabel>
              </IonItem>

              <DatePicker
                ref={datePicker}
                isVisible={false}
                onChange={(date) => {
                  if (onDateSelect) onDateSelect(date);
                }}
              />
            </IonList>
          </IonContent>
        </>
      ) : (
        <>
          <IonHeader>
            <IonToolbar>
              <IonButtons>
                <IonButton onClick={() => setMsgs(null)}>
                  <IonIcon icon={arrowBackOutline}></IonIcon>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {msgs ? (
              <ChatList type={type}>
                {msgs!.map((msg, i) => {
                  if (msg.author.id === profile.id)
                    return (
                      <Me
                        id={msg.id}
                        onDownload={handleOnDownload}
                        key={i}
                        profile={msg.author}
                        timestamp={msg.timestamp}
                        payload={msg.payload}
                        readList={msg.readList}
                        replyTo={msg.replyTo}
                        type="group"
                        isPinned={false}
                        showName={true}
                        showProfilePicture={true}
                      />
                    );
                  return (
                    <Others
                      id={msg.id}
                      onDownload={handleOnDownload}
                      key={i}
                      profile={msg.author}
                      timestamp={msg.timestamp}
                      isPinned={false}
                      payload={msg.payload}
                      readList={msg.readList}
                      replyTo={msg.replyTo}
                      type="group"
                      showName={true}
                      showProfilePicture={true}
                    />
                  );
                })}
              </ChatList>
            ) : (
              <IonList className={styles.search}>
                <IonItem lines="full" button onClick={handleSearchByDate}>
                  <IonIcon slot="start" icon={calendar}></IonIcon>
                  <IonLabel>Search by date</IonLabel>
                </IonItem>

                <DatePicker
                  ref={datePicker}
                  isVisible={false}
                  onChange={onDateSelect}
                />
              </IonList>
            )}
          </IonContent>
        </>
      )}
    </IonPage>
  );
};

export default Search;
