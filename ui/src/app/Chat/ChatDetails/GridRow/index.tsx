import React from "react";
import {
  IonText,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonContent,
  IonItem,
} from "@ionic/react";
import { P2PMessage } from "../../../../redux/p2pmessages/types";
import styles from "./style.module.css";

interface Props {
  files: P2PMessage[];
}

const GridRow: React.FC<Props> = ({ files }) => {
  return (
    <IonRow>
      <IonItem>{"Nicko"}</IonItem>
    </IonRow>
  );
};

export default GridRow;
