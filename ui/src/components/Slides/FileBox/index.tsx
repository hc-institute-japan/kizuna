import {
  IonCard,
  IonCol,
  IonGrid,
  IonInfiniteScroll,
  IonInfiniteScrollContent, IonRow, IonSlide
} from "@ionic/react";
import React, { useRef } from "react";
import { useIntl } from "react-intl";
import { FilePayload } from "../../../redux/commons/types";
import { GroupMessage } from "../../../redux/group/types";
import { P2PMessage } from "../../../redux/p2pmessages/types";
import { Profile } from "../../../redux/profile/types";
import { monthToString } from "../../../utils/helpers";
import FileView from "../../Chat/File/FileView";
import styles from "../style.module.css";

interface Props {
	conversant: Profile,
	orderedFileMessages: P2PMessage[] | GroupMessage[],
	onDownload(file: FilePayload): any;
  onScrollBottom(complete: () => Promise<void>, files: P2PMessage[] | GroupMessage[]): any;
}

/* displays the grid of files */
const FileBox: React.FC<Props> = ({ orderedFileMessages, onDownload, onScrollBottom }) => {
	/* i18n */
	let intl = useIntl();

	/* REFS */
	const infiniteFileScroll = useRef<HTMLIonInfiniteScrollElement>(null);
	const complete = () => infiniteFileScroll.current!.complete();

	// determines the size of the grid columns
	// whole page width for others (looks like list)
	
	// helper code for displaying date
  let currentMonth = -1;

	/* RENDER */
	return (
		<IonSlide>
			<IonGrid>
				<IonRow className={styles.mediarow}>
					{orderedFileMessages.map((message: P2PMessage | GroupMessage) => {
						let month = message.timestamp.getMonth();
						// let year = file.timestamp.getFullYear();
						return (
							<React.Fragment>
								{month !== currentMonth
									? ((currentMonth = month),
										(
											<IonCol size="12">
												<h2 className={styles.month}>
													{monthToString(month, intl)}
												</h2>
											</IonCol>
										))
									: null}
								<IonCol size="12">    
									<IonCard className={styles.mediacard}>
                      <FileView 
												file={message.payload as FilePayload} 
												onDownload={onDownload}
											/>
									</IonCard>
								</IonCol>
							</React.Fragment>
						);
					})}
				</IonRow>

				<IonRow>
					<IonInfiniteScroll
						ref={infiniteFileScroll}
						position="bottom"
						onIonInfinite={(e) => onScrollBottom(complete, orderedFileMessages)}
					>
						<IonInfiniteScrollContent></IonInfiniteScrollContent>
					</IonInfiniteScroll>
				</IonRow>

			</IonGrid>
		</IonSlide>
	)
}

export default FileBox;

