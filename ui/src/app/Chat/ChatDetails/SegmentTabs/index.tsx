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
	displays the tab segments in ChatDetails
	which controls the displayed slides
*/
const SegmentTabs: React.FC<Props> = ({ onSegmentChange }) => {
	let intl = useIntl();

	return (				
		<IonToolbar>
			<IonSegment onIonChange={(e) => onSegmentChange(e.detail.value)}>
				<IonSegmentButton value="Info">
					<IonLabel>{intl.formatMessage({id: "app.chat.chat-details.info"})}</IonLabel>
				</IonSegmentButton>
				
				<IonSegmentButton value="Media">
					<IonLabel>{intl.formatMessage({id: "app.chat.chat-details.media"})}</IonLabel>
				</IonSegmentButton>
				
				<IonSegmentButton value="Files">
					<IonLabel>{intl.formatMessage({id: "app.chat.chat-details.files"})}</IonLabel>
				</IonSegmentButton>
			</IonSegment>
		</IonToolbar>
	);
}; 

export default SegmentTabs;