import { IonToast } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";

interface Props {
  toast: string | null;
  onDismiss(): any;
}

const AddMemberToast: React.FC<Props> = ({ toast, onDismiss }) => {
  const intl = useIntl();
  return (
    <IonToast
      isOpen={toast !== null}
      onDidDismiss={onDismiss}
      message={intl.formatMessage(
        { id: "app.groups.already-member" },
        { name: toast }
      )}
      duration={1000}
      color="danger"
    />
  );
};

export default AddMemberToast;
