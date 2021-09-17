import { IonHeader, IonSearchbar, IonToolbar } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";

interface Props {
  onChange(e: CustomEvent): any;
  onCancel(): any;
}

const AddContactHeader: React.FC<Props> = ({ onChange, onCancel }) => {
  const intl = useIntl();
  return (
    <IonHeader>
      <IonToolbar>
        <IonSearchbar
          placeholder={intl.formatMessage({ id: "app.contacts.search" })}
          showCancelButton="always"
          onIonChange={onChange}
          onIonCancel={onCancel}
          debounce={700}
        />
      </IonToolbar>
    </IonHeader>
  );
};

export default AddContactHeader;
