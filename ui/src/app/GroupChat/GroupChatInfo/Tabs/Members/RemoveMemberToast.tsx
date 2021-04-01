import { IonToast } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";

interface Props {
  toast: boolean;
  onDismiss(): any;
}

const RemoveMemberToast: React.FC<Props> = ({ toast, onDismiss }) => {
  const intl = useIntl();
  return (
    <IonToast
      isOpen={toast}
      onDidDismiss={onDismiss}
      message={intl.formatMessage(
        { id: "app.groups.cannot-remove-member" },
      )}
      duration={1000}
      color="danger"
    />
  );
};

export default RemoveMemberToast;
