import { AgentPubKeyB64 } from "@holochain-open-dev/core-types";

export interface ModalProps {
  name: string;
  stream?: MediaStream;
  remoteStream?: MediaStream;
  onAccept?(): any;
  onReject?(): any;
  onEnd?(): any;
  agents?: AgentPubKeyB64[];
}

export type CallType = "ONGOING" | "RECEIVING" | "REQUESTING";
