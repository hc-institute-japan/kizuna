import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonToggle,
} from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { setPreference } from "../../../redux/preference/actions";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";

const Preference: React.FC = () => {
  const { typingIndicator, readReceipt } = useSelector(
    (state: RootState) => state.preference
  );
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleReadChange = () =>
    dispatch(setPreference({ readReceipt: !readReceipt }));

  const handleTypingChange = () =>
    dispatch(setPreference({ typingIndicator: !typingIndicator }));

  return (
    <IonList>
      <IonListHeader>
        <IonLabel>
          <h1>{intl.formatMessage({id: "app.settings.preference-label"})}</h1>
        </IonLabel>
      </IonListHeader>
      <IonItem>
        <IonLabel>{intl.formatMessage({id: "app.settings.typing-indicator-label"})}</IonLabel>
        <IonToggle checked={typingIndicator} onIonChange={handleTypingChange} />
      </IonItem>
      <IonItem>
        <IonLabel>{intl.formatMessage({id: "app.settings.read-receipt-label"})}</IonLabel>
        <IonToggle checked={readReceipt} onIonChange={handleReadChange} />
      </IonItem>
    </IonList>
  );
};

export default Preference;
