import { serializeHash } from "@holochain-open-dev/core-types";
import { IonButton, IonPage } from "@ionic/react";
import React from "react";
import { createGroupDna, test } from "../../redux/group/actions";
import { getAgentId } from "../../redux/profile/actions";
import {
  dateToTimestamp,
  generatePassphrase,
  useAppDispatch,
} from "../../utils/helpers";

const Playground = () => {
  const dispatch = useAppDispatch();
  return (
    <IonPage>
      <IonButton
        onClick={() => {
          dispatch(getAgentId()).then((id: Buffer) => {
            const serialized = serializeHash(id);
            dispatch(
              createGroupDna(serialized, dateToTimestamp(new Date()))
            ).then((res: any) => console.log(res));
          });
        }}
      >
        Press me
      </IonButton>
      <IonButton
        onClick={() => {
          dispatch(test()).then((res: any) => console.log(res));
        }}
      >
        Press me too
      </IonButton>
      <IonButton
        onClick={async () => {
          const passphrase = await generatePassphrase();
          console.log(passphrase);
        }}
      >
        Press me to generate passphrase
      </IonButton>
    </IonPage>
  );
};

export default Playground;
