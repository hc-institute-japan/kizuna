import { IonButton, IonButtons, IonPage } from "@ionic/react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAllFoos, sendFoo } from "../../redux/bugging/actions";
import { fetchMyContacts } from "../../redux/contacts/actions";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";

const Playground = () => {
  const dispatch = useAppDispatch();
  const contacts = useSelector((state: RootState) => state.contacts.contacts);
  const onSend = () => {
    console.log(contacts);
    let bob = Object.values(contacts)[0].id;
    dispatch(sendFoo(bob, "foo"));
  };
  const onGet = () => {
    dispatch(getAllFoos());
  };
  useEffect(() => {
    dispatch(fetchMyContacts());
  }, []);
  return (
    <IonPage>
      <IonButtons>
        <IonButton onClick={() => onSend()}>Send Foo</IonButton>
        <IonButton onClick={() => onGet()}>Get Foos</IonButton>
      </IonButtons>
    </IonPage>
  );
};

export default Playground;
