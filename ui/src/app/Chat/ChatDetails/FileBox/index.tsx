import React, { useRef } from "react";
import {
	IonCard,
	IonSlide,
	IonGrid,
	IonRow,
	IonCol,
	IonInfiniteScroll,
	IonInfiniteScrollContent
}	 from "@ionic/react";

import ImageView from "../../../../components/Chat/File/ImageView/index";
import VideoView from "../../../../components/Chat/File/VideoView";
import FileView from "../../../../components/Chat/File/FileView";

import { P2PMessage } from "../../../../redux/p2pmessages/types";
import { FilePayload } from "../../../../redux/commons/types";
import { Profile } from "../../../../redux/profile/types";

import { getNextBatchMessages } from "../../../../redux/p2pmessages/actions";

import { useAppDispatch, base64ToUint8Array, dateToTimestamp } from "../../../../utils/helpers";

import styles from "../style.module.css";


interface Props {
	type: "media" | "files",
	conversant: Profile,
	orderedFiles: P2PMessage[]
}

/*
	displays the grid of files
	or the conversant's details (TODO)
*/
const FileBox: React.FC<Props> = ({ type, orderedFiles, conversant }) => {
	const dispatch = useAppDispatch();

	/* REFS */
	const infiniteFileScroll = useRef<HTMLIonInfiniteScrollElement>(null);
	const complete = () => infiniteFileScroll.current!.complete();

	// determines the size of the grid columns
	// whole page width for others (looks like list)
	const colsize = type === "media" ? "3" : "12";
	
	// helper code for displaying date
	const decoder = new TextDecoder();
  const monthText = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  var currentMonth = -1;

	/* HANDLERS */
	/* 
    disptaches an action to hc to get the next batch of older messages of type File
    when reaching the end/bottom of the file box
  */
	const onScrollBottom = (
		complete: () => Promise<void>,
		files: P2PMessage[]
	) => {
		var lastFile: P2PMessage = files[files.length - 1];
	
		dispatch(
			getNextBatchMessages({
				conversant: Buffer.from(base64ToUint8Array(conversant.id)),
				batch_size: 5,
				payload_type: "File",
				last_fetched_timestamp:
					lastFile !== undefined
						? dateToTimestamp(lastFile.timestamp)
						: undefined,
				last_fetched_message_id:
					lastFile !== undefined
						? Buffer.from(
								base64ToUint8Array(lastFile.p2pMessageEntryHash.slice(1))
							)
						: undefined,
			})
		);
		complete();
		return;
	};

	/* REMDER */
	return (
		<IonSlide>
			<IonGrid>
				<IonRow className={styles.mediarow}>
					{orderedFiles.map((file) => {
						let month = file.timestamp.getMonth();
						let year = file.timestamp.getFullYear();
						return (
							<React.Fragment>
								{month !== currentMonth
									? ((currentMonth = month),
										(
											<IonCol size="12">
												<h2 className={styles.month}>
													{monthText[month]}
												</h2>
											</IonCol>
										))
									: null}
								<IonCol size={colsize}>    
									<IonCard className={styles.mediacard}>
										{type === "files"
											? <FileView file={file.payload as FilePayload} />
											: <IonCard className={styles.mediacard}>
													{(file.payload as FilePayload).fileType ==="VIDEO" 
													? <div className={styles.mediadiv}>
															<VideoView file={file.payload as FilePayload} />
														</div>
													: <div className={styles.mediadiv}>
															<ImageView 
																file={file.payload as FilePayload} 
																src={decoder.decode((file.payload as FilePayload).thumbnail!)}
															/>
														</div>
													}
												</IonCard>
										}
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
						onIonInfinite={(e) => onScrollBottom(complete, orderedFiles)}
					>
						<IonInfiniteScrollContent></IonInfiniteScrollContent>
					</IonInfiniteScroll>
				</IonRow>

			</IonGrid>
		</IonSlide>
	)
}

export default FileBox;

