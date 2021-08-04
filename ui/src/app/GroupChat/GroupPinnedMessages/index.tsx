import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import PinnedMessages from "../../../components/PinnedMessages";
import { Payload } from "../../../redux/commons/types";
import { getPinnedMessages } from "../../../redux/group/actions/getPinnedMessages";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";

const GroupPinnedMessages: React.FC = () => {
  const { group } = useParams<{ group: string }>();
  const dispatch = useAppDispatch();

  const [data, setData] = useState<
    { id: string; author: string; payload: Payload; date: Date }[] | null
  >(null);

  // useSelector((state: RootState) => {
  //   // if (state.groups.conversations[group]) {
  //   //   const pinnedMessages = state.groups.conversations[group].pinnedMessages
  //   //     ? state.groups.conversations[group].pinnedMessages!.map(
  //   //         (pinnedMessageId) => {
  //   //           const pinnedMessage =
  //   //             state.groups.pinnedMessages[pinnedMessageId];

  //   //           return {
  //   //             id: pinnedMessageId,
  //   //             payload: pinnedMessage.payload,
  //   //             author: pinnedMessage.author,
  //   //             date: pinnedMessage.timestamp,
  //   //           };
  //   //         }
  //   //       )
  //   //     : [];

  //   //   if (pinnedMessages) {
  //   //   }

  //   //   return [];
  //   // }

  //   return null;
  // });

  // useEffect(() => {
  //   if (!data) dispatch(fetchPinnedMessages(group));
  // }, [data]);

  const { conversation, pinnedMesssages } = useSelector((state: RootState) => ({
    conversation: state.groups.conversations[group],
    pinnedMesssages: state.groups.conversations[group]?.pinnedMessages,
  }));

  useEffect(() => {
    dispatch(getPinnedMessages(group)).then((res: any) => setData(res));
  }, [conversation, pinnedMesssages]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton defaultHref={`/g/${group}`}></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {data ? (
          <PinnedMessages
            type="group"
            onMessageClick={(message) => {}}
            messages={data}
          />
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default GroupPinnedMessages;
