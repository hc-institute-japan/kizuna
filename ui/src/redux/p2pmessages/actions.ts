// import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { ThunkAction } from "../types";
import { TextPayload, FilePayload, FileBytesID } from "../commons/types";
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
import { Uint8ArrayToBase64, timestampToDate, base64ToUint8Array } from "../../utils/helpers";
import { 
    P2PMessageConversationState,
    P2PConversation,
    P2PMessage, 
    P2PMessageReceipt,
    Read 
} from "../../redux/p2pmessages/types";
import { AgentPubKey, HoloHash } from "@holochain/conductor-api";
import { 
    FilePayloadInput, 
    FileType,
    MessageID,
} from "../commons/types";
import { receipt } from "ionicons/icons";
import { Profile } from "../profile/types";
import store from "../../redux/store";

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

    // transform messages
    var filesToFetch: { [key: string]: Uint8Array } = {};
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

    let consolidatedUIObject: P2PMessageConversationState = { 
        conversations: transformedConversations, 
        messages: transformedMesssages, 
        receipts: transformedReceipts,
        files: filesToFetch,
        typing: {}
    };

    console.log("Actions transformZomeDataToUIData", consolidatedUIObject);

    return consolidatedUIObject;
}

export const setMessages = (state: P2PMessageConversationState): ThunkAction => async (
    dispatch,
) => {
    console.log("Actions dispatching SET_MESSAGES", state)
    dispatch({
        type: SET_MESSAGES,
        state,
    });
    return true;
}

export const setFiles = ( filesToFetch: { [key: string]: Uint8Array }): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("Actions fetching files", filesToFetch);
    const fetchedFiles = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
        payload: Object.keys(filesToFetch)
    });

    if (fetchedFiles?.type !== "error") {
        console.log("Actions SET_FILES dispatching to reducer", fetchedFiles)
        dispatch({
            type: SET_FILES,
            sate: fetchedFiles
        });
        return true;
    }
    console.log("Actions error in fetching files", fetchedFiles)
}

export const appendMessage = (state: { message: P2PMessage, receipt: P2PMessageReceipt, file?: P2PFile}): ThunkAction => async (
    dispatch
) => {
    console.log("Actions dispatching APPEND_MESSAGE")
    dispatch({
        type: APPEND_MESSAGE,
        state
    });
    return true;
}

export const appendReceipt = (state: P2PMessageReceipt): ThunkAction => async (
    dispatch
) => {
    console.log("Actions dispatching APPEND_RECEIPT");
    dispatch({
        type: APPEND_RECEIPT,
        state
    });
    return true;
}

export const sendMessage = (receiver: AgentPubKey, message: string, type: string, replyTo?: HoloHash, file?: any): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("Actions send message")

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
        console.log("actions file", file)
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

    let input: MessageInput = {
        receiver: receiver,
        payload: payloadInput,
        reply_to: replyTo
    };

    const sentMessage = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
        payload: input
    });

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
    console.log("actions failed to send message", sentMessage);
    return false;
}

// TODO: use the aggregator
export const getLatestMessages = (size: number): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("Actions get latest");

    // CALL ZOME
    const batchSize: BatchSize = size; 
    const p2pLatestState = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
        payload: batchSize
    });
    
    // DISPATCH TO REDUCER
    if (p2pLatestState?.type !== "error") {
        let toDispatch = transformZomeDataToUIData(p2pLatestState);
        console.log("Actions setting messages after getting latest", p2pLatestState, ">", toDispatch);
        dispatch(setMessages(toDispatch));

        return toDispatch;
    };

    // ERROR
    console.log("failed to get latest messages", p2pLatestState);
    return false;
}

export const getNextBatchMessages = (filter: P2PChatFilterBatch): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("Actions getting next batch")
    
    // CALL ZOME
    const nextBatchOfMessages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_NEXT_BATCH_MESSAGES,
        payload: filter
    });

    // DISPATCH TO REDUCER
    if (nextBatchOfMessages?.type !== "error") {
        let toDispatch = transformZomeDataToUIData(nextBatchOfMessages);
        console.log("Actions get next batch complete", nextBatchOfMessages);
        if (Object.values(nextBatchOfMessages[1]).length > 0) dispatch({
            type: SET_MESSAGES,
            state: toDispatch
        });
        return nextBatchOfMessages;
    };

    // ERROR
    console.log("actions failed to get next batch", nextBatchOfMessages)
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

export const readMessage = (messages: P2PMessage[]): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("actions reading message");
    let now = Date.now();
    let seconds = (now/1000)>>0;
    let nanoseconds = (now%1000)*10**6;
    // let status: Read = { timestamp: [seconds, nanoseconds] }
    let timestamp = [seconds, nanoseconds];

    let hashes: any = [];
    messages.map((message) => hashes.push(base64ToUint8Array(message.p2pMessageEntryHash.slice(1))));

    let sender = Buffer.from(base64ToUint8Array(messages[0].author.slice(1)));

    let input = {
        message_hashes: hashes,
        sender: sender,
        timestamp: timestamp,
    }

    const readReceiptMap = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].READ_MESSAGE,
        payload: input
    })
        
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

        console.log("actions appending receipt", p2preceipt);
        dispatch({
            type: APPEND_RECEIPT,
            state: p2preceipt
        })
        return true;
    }

    console.log("actions failed to read messags", readReceiptMap)
    return false;

}

export const getFileBytes = (hashes: Uint8Array[]): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("Actions getting file bytes");
    const fetchedFiles = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_FILE_BYTES,
        payload: hashes
    });
    
    let transformedFiles: { [key:string]: Uint8Array } = {};
    if (fetchedFiles?.type !== "error") {
        console.log("Actions get file bytes", fetchedFiles);
        Object.keys(fetchedFiles).map((key) => {
            transformedFiles["u" + key] = fetchedFiles[key];
        });

        if (Object.entries(transformedFiles).length > 0) dispatch({
            type: SET_FILES,
            state: transformedFiles
        });
        return transformedFiles;
    };
    console.log("actions failed to get next batch", transformedFiles);
    return false;
}

export const setTyping = (data: any): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("Actions setting typing profile", data);
    let username = store.getState().profile.username!;

    let profile = {
        id: data.agent,
        username: username
    }
    dispatch({
        type: SET_TYPING,
        state: {
            profile: profile,
            isTyping: data.isTyping
        }
    })
}

export const isTyping = (agent: AgentPubKey, isTyping: boolean): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    let payload = {
        agent: agent,
        isTyping: isTyping

    }
    let typing = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].TYPING,
        payload: payload
    });

    if (typing?.type !== "error") {
        // console.log("Actions indicated i am typing");
        return true;
    }
    // console.log("error in indicating i am typing", typing);
    return false;
}