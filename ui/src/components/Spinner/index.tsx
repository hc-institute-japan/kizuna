import { IonSpinner } from "@ionic/react";
import React from "react";
import styles from "./style.module.css";

const Spinner: React.FC<any> = (props) => (
  <div className={styles.spinner}>
    <IonSpinner {...props} />
  </div>
);

export default Spinner;
