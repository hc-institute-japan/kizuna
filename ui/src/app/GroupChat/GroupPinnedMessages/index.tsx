import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import PinnedMessages from "../../../components/PinnedMessages";
import { Payload } from "../../../redux/commons/types";
import { getPinnedMessages } from "../../../redux/group/actions/getPinnedMessages";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";

const GroupPinnedMessages: React.FC = () => {
  const { group } = useParams<{ group: string }>();
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [data, setData] = useState<
    { id: string; author: string; payload: Payload; date: Date }[] | null
  >(null);

  const { conversation, pinnedMesssages } = useSelector((state: RootState) => ({
    conversation: state.groups.conversations[group],
    pinnedMesssages: state.groups.conversations[group]?.pinnedMessages,
  }));

  useEffect(() => {
    dispatch(getPinnedMessages(group)).then((res: any) => setData(res));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, pinnedMesssages]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton
              onClick={() => history.push({ pathname: `/g/${group}` })}
              className="ion-no-padding"
            >
              <IonIcon slot="icon-only" icon={arrowBackSharp} />
            </IonButton>
            <IonTitle>
              {intl.formatMessage({
                id: "app.group-chat.pinned-message-title",
              })}
            </IonTitle>
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
