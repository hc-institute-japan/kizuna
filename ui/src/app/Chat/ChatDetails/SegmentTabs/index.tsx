import {
	IonLabel,
	IonToolbar,
	IonSegment,
	IonSegmentButton,
} from "@ionic/react";
import React from "react";

interface Props {
	onSegmentChange(index: any): any
}

/*
	displays the tab segments in ChatDetails
	which controls the displayed slides
*/
const SegmentTabs: React.FC<Props> = ({ onSegmentChange }) => {

	return (				
		<IonToolbar>
			<IonSegment onIonChange={(e) => onSegmentChange(e.detail.value)}>
				<IonSegmentButton value="Info">
					<IonLabel>Info</IonLabel>
				</IonSegmentButton>
				
				<IonSegmentButton value="Media">
					<IonLabel>Media</IonLabel>
				</IonSegmentButton>
				
				<IonSegmentButton value="Files">
					<IonLabel>Files</IonLabel>
				</IonSegmentButton>
			</IonSegment>
		</IonToolbar>
	);
}; 

export default SegmentTabs;