import { FUNCTIONS, ZOMES } from "../../connection/types";
import { ThunkAction } from "../types";
import { AgentPubKey, HoloHash } from "@holochain/conductor-api";
import { 
    debounce,
    timestampToDate, 
    Uint8ArrayToBase64, 
    base64ToUint8Array 
} from "../../utils/helpers";
import { 
    TextPayload,
    FilePayloadInput, 
    FileType,
    MessageID 
} from "../commons/types";
import { 
    P2PMessageConversationState,
    P2PConversation,
    P2PMessage, 
    P2PMessageReceipt
} from "../../redux/p2pmessages/types";
import { 
    BatchSize,
    MessageInput, 
    P2PChatFilterBatch, 
    P2PFile,
    SET_FILES, 
    SET_TYPING,
    SET_MESSAGES,  
    APPEND_MESSAGE, 
    APPEND_RECEIPT 
} from "./types";

// helper function to transform HC data structures to UI/redux data structures
export const transformZomeDataToUIData = (zomeResults: P2PMessageConversationState) => {

    // destructure zome hashmap results
    let { 0: zomeConversations, 1: zomeMessages, 2: zomeReceipts } = Object.values(zomeResults);

    // transform conversations
    var transformedConversations: { [key: string]: P2PConversation } = {};
    for (const [key, value] of Object.entries(zomeConversations)) {
        let messageIDs: MessageID[] = value as MessageID[];
        let conversation: P2PConversation = {
            messages: messageIDs
        };
        transformedConversations[key] = conversation;
    };

    // get a list of files to fetch from HC (on a different zome call)
    var filesToFetch: { [key: string]: Uint8Array } = {};
    // transform messages
    var transformedMesssages: { [key: string]: P2PMessage } = {};
    for (const [key, value] of Object.entries(zomeMessages)) {
        let { 0: message, 1: receiptArray } = Object(value);
        var payload;
        switch (message.payload.type) {
            case "TEXT":
                payload = message.payload;
                break;
            case "FILE":
                payload = {
                type: "FILE",
                fileName: message.payload.payload.metadata.fileName,
                fileSize: message.payload.payload.metadata.fileSize,
                fileType: message.payload.payload.fileType.type,
                fileHash: Uint8ArrayToBase64(message.payload.payload.metadata.fileHash),
                thumbnail: message.payload.payload.fileType.type != "OTHER" 
                            ? message.payload.payload.fileType.payload.thumbnail
                            : null
                };
                filesToFetch[message.payload.payload.metadata.fileHash] = new Uint8Array;
                break
            default:
                break
        };

        let p2pMessage = {
            p2pMessageEntryHash: key,
            author: "u" + Uint8ArrayToBase64(message.author),
            receiver: "u" + Uint8ArrayToBase64(message.receiver),
            payload: payload,
            timestamp: timestampToDate(message.timeSent),
            replyTo: message.replyTo,
            receipts: receiptArray
        };

        transformedMesssages[key] = p2pMessage
    };
    
    // transform receipts
    var transformedReceipts: { [key: string]: P2PMessageReceipt } = {};
    for (const [key, value] of Object.entries(zomeReceipts)) {
        const { id, status: statusTuple } = Object(value);
        const { status, timestamp } = statusTuple;

        let p2preceipt = {
            p2pMessageReceiptEntryHash: key,
            p2pMessageEntryHashes: id,
            timestamp: timestampToDate(timestamp),
            status: status
        };

        transformedReceipts[key] = p2preceipt;
    }

    // consolidate transformed objects
    let consolidatedUIObject: P2PMessageConversationState = { 
        conversations: transformedConversations, 
        messages: transformedMesssages, 
        receipts: transformedReceipts,
        files: filesToFetch,
        typing: {}
    };

    // console.log("Actions transformZomeDataToUIData", consolidatedUIObject);

    return consolidatedUIObject;
}

// action to set P2PMessageConversations into the redux state
export const setMessages = (state: P2PMessageConversationState): ThunkAction => async (
    dispatch,
) => {
    // console.log("Actions dispatching SET_MESSAGES", state)
    dispatch({
        type: SET_MESSAGES,
        state,
    });
    return true;
}

// action to set the FileBytes into the redux state
export const setFiles = ( filesToFetch: { [key: string]: Uint8Array }): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    // takes a list of file addresses to fetch from HC
    // console.log("Actions fetching files", filesToFetch);
    const fetchedFiles = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
        payload: Object.keys(filesToFetch)
    });

    if (fetchedFiles?.type !== "error") {
        // console.log("Actions SET_FILES dispatching to reducer", fetchedFiles)
        dispatch({
            type: SET_FILES,
            sate: fetchedFiles
        });
        return true;
    }
    // console.log("Actions error in fetching files", fetchedFiles)
}

// action to append a message and receipt (return values of p2p send_message) into the redux state after a user sends a message
// will also append the file bytes if message type is file (does not fetch from HC)
export const appendMessage = (state: { message: P2PMessage, receipt: P2PMessageReceipt, file?: P2PFile}): ThunkAction => async (
    dispatch
) => {
    // console.log("Actions dispatching APPEND_MESSAGE")
    dispatch({
        type: APPEND_MESSAGE,
        state
    });
    return true;
}

// action to append a receipt (carried by signals when a message is read) into the redux state
export const appendReceipt = (state: P2PMessageReceipt): ThunkAction => async (
    dispatch
) => {
    // console.log("Actions dispatching APPEND_RECEIPT");
    dispatch({
        type: APPEND_RECEIPT,
        state
    });
    return true;
}

// action to send a message
// takes in the parameters of message_input
export const sendMessage = (
    receiver: AgentPubKey, 
    message: string, 
    type: string, 
    replyTo?: HoloHash, 
    file?: any
): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    // console.log("Actions send message")

    // construct the payload input structure (text or file)
    var payloadInput;
    if (type == "TEXT") {
        let textPayload: TextPayload = {
            type: "TEXT",
            payload: { 
                payload: message
            }
        };
        payloadInput = textPayload;
    } else {
        let fileType: FileType = {
            type: file.fileType.type,
            payload: file.fileType.type != "OTHER" ? { thumbnail: file.fileType.payload.thumbnail } : null
        }
        let filePayload: FilePayloadInput = {
            type: "FILE",
            payload: {
                metadata: file.metadata,
                fileType: fileType,
                fileBytes: file.fileBytes,
            }
        };
        payloadInput = filePayload;
    }

    // construct the message input structure
    let input: MessageInput = {
        receiver: receiver,
        payload: payloadInput,
        reply_to: replyTo
    };

    // CALL ZOME
    const sentMessage = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
        payload: input
    });

    // transform the return value of the send_message function (message and receipt)
    // send_message return value is not consistent with the structures of the get functions
    // TODO: standardize return values in HC
    if (sentMessage?.type !== "error") {
        console.log("Action sent Message", sentMessage);
        const [ messageTuple, receiptTuple ] = sentMessage;
        const [ messageID, message ] = messageTuple
        const [ receiptID, receipt ] = receiptTuple!;

        let messageHash = "u" + Uint8ArrayToBase64(messageID);
        let receiptHash = "u" + Uint8ArrayToBase64(receiptID);
        
        var payload;
        switch (message.payload.type) {
        case "TEXT":
            payload = message.payload;
            break;
        case "FILE":
            payload = {
            type: "FILE",
            fileName: message.payload.payload.metadata.fileName,
            fileSize: message.payload.payload.metadata.fileSize,
            fileType: message.payload.payload.fileType.type,
            fileHash: Uint8ArrayToBase64(message.payload.payload.metadata.fileHash),
            thumbnail: message.payload.payload.fileType.type != "OTHER" 
                        ? message.payload.payload.fileType.payload.thumbnail
                        : null
            }
            break
        default:
            break
        }

        let p2pMessage: P2PMessage = {
            p2pMessageEntryHash: messageHash,
            author: "u" + Uint8ArrayToBase64(message.author),
            receiver: "u" + Uint8ArrayToBase64(message.receiver),
            payload: payload,
            timestamp: timestampToDate(message.timeSent),
            replyTo: message.replyTo,
            receipts: [receiptHash]
        }

        let messageEntryHash = "u" + Uint8ArrayToBase64((receipt.id)[0]);
        let p2pReceipt: P2PMessageReceipt = {
            p2pMessageReceiptEntryHash: "u" + Uint8ArrayToBase64(receiptID),
            p2pMessageEntryHashes: [messageEntryHash],
            timestamp: timestampToDate(receipt.status.timestamp),
            status: receipt.status.status
        }

        let p2pFile = type == "FILE" ? {
            fileHash: "u" + payload.fileHash, 
            fileBytes: file.fileBytes 
        } : undefined;

        // DISPATCH TO REDUCER
        dispatch(appendMessage({
            message: p2pMessage, 
            receipt: p2pReceipt, 
            file: p2pFile != undefined
                ? p2pFile : undefined 
            }
        ));
        
        console.log("actions successfully sent message");
        return true;
    };

    // ERROR
    console.log("actions failed to send message", sentMessage);
    return false;
}


// action to get the latest messages (called when the application starts)
// takes in a the batch size as input
export const getLatestMessages = (size: number): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    // console.log("Actions get latest");

    // CALL ZOME
    const batchSize: BatchSize = size; 
    const p2pLatestState = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
        payload: batchSize
    });
    // console.log("Actions get latest", p2pLatestState)
    
    // DISPATCH TO REDUCER
    if (p2pLatestState?.type !== "error") {
        let toDispatch = transformZomeDataToUIData(p2pLatestState);
        // console.log("Actions setting messages after getting latest", p2pLatestState, ">", toDispatch);
        dispatch(setMessages(toDispatch));

        return toDispatch;
    };

    // ERROR
    // console.log("failed to get latest messages", p2pLatestState);
    return false;
}

// action to get messages in batches (called while scrolling in chat boxes and media boxes)
export const getNextBatchMessages = (filter: P2PChatFilterBatch): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    // console.log("Actions getting next batch")
    
    // CALL ZOME
    const nextBatchOfMessages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_NEXT_BATCH_MESSAGES,
        payload: filter
    });

    // DISPATCH TO REDUCER
    if (nextBatchOfMessages?.type !== "error") {
        let toDispatch = transformZomeDataToUIData(nextBatchOfMessages);
        // console.log("Actions get next batch complete", nextBatchOfMessages);
        if (Object.values(nextBatchOfMessages[1]).length > 0) dispatch({
            type: SET_MESSAGES,
            state: toDispatch
        });
        return nextBatchOfMessages;
    };

    // ERROR
    // console.log("actions failed to get next batch", nextBatchOfMessages)
    return false;
}

// export const getMessagesByAgentByTimestamp = (conversant: AgentPubKey, date: Date, payloadType: number): ThunkAction => async (
//     dispatch,
//     _getState,
//     { callZome }
// ) => {
//     const batchSize: BatchSize = size;

//     const messages = await callZome({
//         zomeName: ZOMES.P2PMESSAGE,
//         fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
//         payload: batchSize
//     });

//     if (messages?.type !== "error") {
//         return messages;
//     };
//     return false;
// }

// action to mark an array of messages as read (called in the onSeen callback)
export const readMessage = (messages: P2PMessage[]): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    // console.log("actions reading message");

    // CONSTRUCT ZOME INPUT
    // construct the timestamp
    let now = Date.now();
    let seconds = (now/1000)>>0;
    let nanoseconds = (now%1000)*10**6;
    let timestamp = [seconds, nanoseconds];

    // get hashes of messages to be marked
    let hashes: any = [];
    messages.map((message) => hashes.push(base64ToUint8Array(message.p2pMessageEntryHash.slice(1))));

    // get the sender (sender = conversant since p2p)
    let sender = Buffer.from(base64ToUint8Array(messages[0].author.slice(1)));

    let input = {
        message_hashes: hashes,
        sender: sender,
        timestamp: timestamp,
    }

    // CALL ZOME
    const readReceiptMap = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].READ_MESSAGE,
        payload: input
    })
        
    // DISPATCH TO REDUCER
    if (readReceiptMap?.type !== "error") {
        let [key] = Object.keys(readReceiptMap);

        let messageIDs: string[] = [];
        readReceiptMap[key].id.forEach((id: Uint8Array) => {
            messageIDs.push("u" + Uint8ArrayToBase64(id))
        });

        let p2preceipt = {
            p2pMessageReceiptEntryHash: key,
            p2pMessageEntryHashes: messageIDs,
            timestamp: timestampToDate(readReceiptMap[key].status.timestamp),
            status: readReceiptMap[key].status.status
        }

        // console.log("actions appending receipt", p2preceipt);
        dispatch({
            type: APPEND_RECEIPT,
            state: p2preceipt
        })
        return true;
    }

    // ERROR
    // console.log("actions failed to read messags", readReceiptMap)
    return false;

}

// action to get the file bytes of a list of file addresses
export const getFileBytes = (hashes: Uint8Array[]): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    // console.log("Actions getting file bytes");
    const fetchedFiles = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_FILE_BYTES,
        payload: hashes
    });
    
    let transformedFiles: { [key:string]: Uint8Array } = {};
    if (fetchedFiles?.type !== "error") {
        // console.log("Actions get file bytes", fetchedFiles);
        Object.keys(fetchedFiles).map((key) => {
            transformedFiles[key] = fetchedFiles[key];
        });

        if (Object.entries(transformedFiles).length > 0) dispatch({
            type: SET_FILES,
            state: transformedFiles
        });
        return transformedFiles;
    };
    // console.log("actions failed to get next batch", transformedFiles);
    return false;
}

// action to call typing
export const isTyping = (agent: AgentPubKey, isTyping: boolean): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    let payload = {
        agent: agent,
        isTyping: isTyping

    }

    callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].TYPING,
        payload: payload
    })
    
    setTimeout(
        () => callZome({
            zomeName: ZOMES.P2PMESSAGE,
            fnName: FUNCTIONS[ZOMES.P2PMESSAGE].TYPING,
            payload: {
                agent: agent,
                isTyping: false
            }
        }), 
        5000
    )

    return

    // if (typing?.type !== "error") {
    //     // console.log("Actions indicated i am typing", typing);
    //     return true;
    // }
    // // console.log("error in indicating i am typing", typing);
    // return false;
}