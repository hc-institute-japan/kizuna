import { IonToast } from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";

interface Props {
  toast: boolean;
  onDismiss(): any;
}

const OldestFetchedToast: React.FC<Props> = ({ toast, onDismiss }) => {
  const intl = useIntl();
  return (
    <IonToast
      isOpen={toast !== false}
      onDidDismiss={onDismiss}
      message={intl.formatMessage(
        { id: "app.groups.oldest-message-fetched" },
      )}
      duration={500}
      color="light"
    />
  );
};

export default OldestFetchedToast;
