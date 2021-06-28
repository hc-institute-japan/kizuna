import { IonInput, IonItemGroup, IonLabel } from "@ionic/react";
import React, { useEffect, useState } from "react";
import styles from "./style.module.css";

// interface Props {
//   error?: string;
//   value: any;
//   onIonChange: (e: CustomEvent) => any;
//   placeho
// }

const HomeInput: React.FC<any> = ({ error, className, ...props }) => {
  const [withError, setWithError] = useState(false);
  useEffect(() => {
    setWithError(error ? true : false);
  }, [error]);
  return (
    <IonItemGroup>
      <IonInput
        className={`${styles.input} ${
          withError ? styles["error-input"] : ""
        } ${className}`}
        {...props}
      ></IonInput>
      <div className={styles["error-container"]}>
        {withError ? (
          <IonLabel color="danger" className={`ion-text-wrap ${styles.error}`}>
            {error}
          </IonLabel>
        ) : null}
      </div>
    </IonItemGroup>
  );
};

export default HomeInput;
