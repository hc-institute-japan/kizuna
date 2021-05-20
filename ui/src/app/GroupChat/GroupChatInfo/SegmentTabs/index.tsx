import {
	IonLabel,
	IonToolbar,
	IonSegment,
	IonSegmentButton,
} from "@ionic/react";
import React from "react";
import { useIntl } from "react-intl";

interface Props {
	onSegmentChange(index: any): any
}

/*
	displays the tab segments in GroupChat detail page
	which controls the displayed slides
*/
const SegmentTabs: React.FC<Props> = ({ onSegmentChange }) => {
	let intl = useIntl();

	return (				
    // <IonToolbar className={styles.menu}>
    <IonToolbar>
      <IonSegment slot="start" onIonChange={(e) => onSegmentChange(e.detail.value)}>
        <IonSegmentButton value="info">
          <IonLabel>{intl.formatMessage({ id: "app.group-chat.label-info" })}</IonLabel>
        </IonSegmentButton>
      
        <IonSegmentButton value="media">
          <IonLabel>{intl.formatMessage({ id: "app.group-chat.label-media" })}</IonLabel>
        </IonSegmentButton>
      
        <IonSegmentButton value="files">
          <IonLabel>{intl.formatMessage({ id: "app.group-chat.label-files" })}</IonLabel>
        </IonSegmentButton>
      </IonSegment>
    </IonToolbar>
	);
}; 

export default SegmentTabs;