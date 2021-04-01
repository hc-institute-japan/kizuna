import { IonLabel } from "@ionic/react";
import React, { useEffect } from "react";
import { getNextBatchGroupMessages } from "../../../../../redux/group/actions";
import { GroupMessageBatchFetchFilter, GroupMessagesOutput } from "../../../../../redux/group/types";
import { base64ToUint8Array, useAppDispatch } from "../../../../../utils/helpers";

interface Props {
    groupId: string;
}

const Media: React.FC<Props> = ({groupId}) => {
    const dispatch = useAppDispatch();
    // const [files, setFiles] = useState<(FilePayload |)[]>([]);

    // const indexMedia: (files: FilePayload[]) => IndexedMedia = (
    //     contacts
    //   ) => {
    //     let indexedContacts: IndexedMedia = {};
    //     if (contacts.length > 0) {
    //       let char = contacts[0].username.charAt(0).toUpperCase();
    //       indexedContacts[char] = [];
    //       contacts.forEach((contact: Profile) => {
    //         const currChar = contact.username.charAt(0).toUpperCase();
    //         if (currChar !== char) {
    //           char = currChar;
    //           indexedContacts[char] = [];
    //         }
    //         const currArr = indexedContacts[currChar];
    //         currArr.push(contact);
    //       });
    //     }
    //     return indexedContacts;
    //   };

    // const indexedContacts = indexContacts(
    //     Object.values(contacts).filter((contact) =>
    //       contact.username.toLowerCase().includes(filter.toLowerCase())
    //     )
    // );

    useEffect(() => {
        let filter: GroupMessageBatchFetchFilter = {
            groupId: base64ToUint8Array(groupId),
            batchSize: 10,
            payloadType: { type: "FILE", payload: null },
        }
        dispatch(getNextBatchGroupMessages(filter)).then((res: GroupMessagesOutput) => {
            // let files: (FilePayload | undefined)[] = Object.keys(res.groupMessagesContents).map((key: any) => {
            //     if (!isTextPayload(res.groupMessagesContents[key].payload)) {
            //         let payload: FilePayload = res.groupMessagesContents[key].payload as FilePayload;
            //         return payload
            //     }
            // });
            // setFiles(files)
        })
    }, [dispatch, groupId])
    
  return <IonLabel>THIS IS MEDIA!!</IonLabel>
};

export default Media;