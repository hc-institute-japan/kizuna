// import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { ThunkAction } from "../types";
import { TextPayload, FilePayload } from "../commons/types";
import { MessageInput, BatchSize, P2PChatFilterBatch, SET_MESSAGES, APPEND_MESSAGE, APPEND_RECEIPT, SET_FILES, SET_TYPING } from "./types";
import { Uint8ArrayToBase64, timestampToDate, base64ToUint8Array } from "../../utils/helpers";

import { P2PMessageConversationState, P2PMessage, P2PMessageReceipt, Read } from "../../redux/p2pmessages/types";
import { AgentPubKey, HoloHash } from "@holochain/conductor-api";
import { FilePayloadInput, FileType } from "../commons/types";
import { receipt } from "ionicons/icons";
import { Profile } from "../profile/types";
import store from "../../redux/store";

export const setMessages = (state: P2PMessageConversationState): ThunkAction => async (
    dispatch,
) => {
    console.log("Actions dispatchinmg SET_MESSAGES", state)
    dispatch({
        type: SET_MESSAGES,
        state,
    });
    return true;
}

export const appendMessage = (state: { message: P2PMessage, receipt: P2PMessageReceipt}): ThunkAction => async (
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
    console.log("Actions calling send message")

    var payload;
    if (type == "TEXT") {
        let textPayload: TextPayload = {
            type: "TEXT",
            payload: { 
                payload: message
            }
        };
        payload = textPayload;
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
        payload = filePayload;
    }

    console.log("actions", payload);
    let input: MessageInput = {
        receiver: receiver,
        payload: payload,
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
            fileHash:"u" + Uint8ArrayToBase64(message.payload.payload.metadata.fileHash),
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

        dispatch(appendMessage({message: p2pMessage, receipt: p2pReceipt}));
        
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
    const batchSize: BatchSize = size; 

    const messages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
        payload: batchSize
    });

    if (messages?.type !== "error") {
        console.log("Actions get latest", messages);
        dispatch(setMessages(messages));

        return messages;
    };
    console.log("failed to get latest messages", messages);
    return false;
}

export const getNextBatchMessages = (filter: P2PChatFilterBatch): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("actions getting next batch")
    const messages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_NEXT_BATCH_MESSAGES,
        payload: filter
    });

    if (messages?.type !== "error") {
        console.log("Actions get next batch complete", messages);
        if (Object.values(messages[1]).length > 0) dispatch({
            type: SET_MESSAGES,
            state: messages
        });
        return messages;
    };
    console.log("actions failed to get next batch", messages)
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
    let status: Read = { timestamp: [seconds, nanoseconds] }

    let hashes: any = [];
    messages.map((message) => hashes.push(base64ToUint8Array(message.p2pMessageEntryHash.slice(1))));
    console.log("actions", hashes)

    let timestamp = [seconds, nanoseconds];
    let sender = Buffer.from(base64ToUint8Array(messages[0].author.slice(1)));

    let input = {
        message_hashes: hashes,
        sender: sender,
        timestamp: timestamp,
    }

    const receiptMap = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].READ_MESSAGE,
        payload: input
    })
        
    if (receiptMap?.type !== "error") {
        let [key] = Object.keys(receiptMap);
        
        let messageEntryHash = "u" + Uint8ArrayToBase64((receiptMap[key].id)[0]);
        let p2preceipt = {
            p2pMessageReceiptEntryHash: key,
            p2pMessageEntryHashes: [messageEntryHash],
            timestamp: timestampToDate(receiptMap[key].status.timestamp),
            status: receiptMap[key].status.status
        }
        console.log("actions appending receipt", p2preceipt);
        dispatch({
            type: APPEND_RECEIPT,
            state: p2preceipt
        })
        return true;
    }

    console.log("actions failed to read messags", receiptMap)
    return false;

}

export const getFileBytes = (hashes: Uint8Array[]): ThunkAction => async (
    dispatch,
    _getState,
    { callZome }
) => {
    console.log("Actions getting file bytes");
    const files = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_FILE_BYTES,
        payload: hashes
    });

    if (files?.type !== "error") {
        console.log("Actions get file bytes", files);
        if (Object.entries(files).length > 0) dispatch({
            type: SET_FILES,
            state: files
        });
        return files;
    };
    console.log("actions failed to get next batch", files)
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
    console.log("Actions indicating i am typing");
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