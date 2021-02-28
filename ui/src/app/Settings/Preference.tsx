import {
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonToggle,
} from "@ionic/react";
import React from "react";
import { useSelector } from "react-redux";
import { setPreference } from "../../redux/preference/actions";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";

const Preference: React.FC = () => {
  const { typingIndicator, readReceipt } = useSelector(
    (state: RootState) => state.preference
  );
  const dispatch = useAppDispatch();

  const handleReadChange = () =>
    dispatch(setPreference({ readReceipt: !readReceipt }));

  const handleTypingChange = () =>
    dispatch(setPreference({ typingIndicator: !typingIndicator }));

  return (
    <IonList>
      <IonListHeader>
        <IonLabel>
          <h1>Preference</h1>
        </IonLabel>
      </IonListHeader>
      <IonItem>
        <IonLabel>Typing Indicator</IonLabel>
        <IonToggle checked={typingIndicator} onIonChange={handleTypingChange} />
      </IonItem>
      <IonItem>
        <IonLabel>Read Receipt</IonLabel>
        <IonToggle checked={readReceipt} onIonChange={handleReadChange} />
      </IonItem>
    </IonList>
  );
};

export default Preference;
