import { IonButton, IonButtons, IonPage } from "@ionic/react";
import React from "react";
import { getAllFoos, sendFoo } from "../../redux/bugging/actions";
import { useAppDispatch } from "../../utils/helpers";

const Playground = () => {
  const dispatch = useAppDispatch();
  const onSend = () => {
    dispatch(sendFoo());
  };
  const onGetFoos = () => {
    dispatch(getAllFoos());
  };
  return (
    <IonPage>
      <IonButtons>
        <IonButton onClick={() => onSend()}>Send Foo</IonButton>
        <IonButton onClick={() => onGetFoos()}>Get Foos</IonButton>
      </IonButtons>
    </IonPage>
  );
};

export default Playground;
