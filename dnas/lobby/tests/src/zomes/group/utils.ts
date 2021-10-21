export function getGroupfromGroupOutput(group_output) {
  return {
    name: group_output.latestName,
    created: group_output.created,
    creator: group_output.creator,
    members: group_output.members,
  };
}

export function sendMessageSignalHandler(signal, signals) {
  return function (sender) {
    if (signal.data.payload.payload.type === "GROUP_MESSAGE_DATA") {
      signals.push(signal.data.payload.payload);
    }
  };
}

export function evaluateMessagesFromSignal(messagesFromSignal, messages, t) {
  console.log("is this running?");
  Object.keys(messagesFromSignal).forEach((group) => {
    Object.keys(messagesFromSignal[group]).forEach((agent) => {
      t.deepEqual(
        messagesFromSignal[group][agent].filter(
          (v, i, a) =>
            a.findIndex((t) => JSON.stringify(t) === JSON.stringify(v)) === i
        ),
        messages.filter(
          (message) =>
            JSON.stringify(message.content.sender) !== agent &&
            JSON.stringify(message.content.groupHash) === group
        )
      );
    });
  });
}

export function strToUtf8Bytes(str) {
  const bytes: Array<number> = [];

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i); // x00-xFFFF
    bytes.push(code & 255); // low, high
  }

  return bytes;
}
