import {
	IonButtons,
	IonBackButton,
	IonToolbar,
} from "@ionic/react";
import React from "react";
import styles from "../style.module.css";

interface Props {
	username: String
}

/*
	displays the header and name of conversant in ChatDetails
*/
const ContactHeader: React.FC<Props> = ({ username }) => {

	return (
		<div>
			<IonToolbar className={styles.controls}>
				<span>
					<IonButtons slot="start">
						<IonBackButton
							defaultHref={`/u/${username}`}
							className="ion-no-padding"
							/>
					</IonButtons>
				</span>
			</IonToolbar>
			
			<div className={styles.titlebar}>
				<p className={styles.title}>{username}</p>
			</div>
		</div>
	);
}; 

export default ContactHeader;