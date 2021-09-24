import {
  AgentPubKeyB64,
  deserializeHash,
} from "@holochain-open-dev/core-types";
import { IonButton, IonCol, IonGrid, IonPage, IonRow } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { SIGNALS, ZOMES } from "../../connection/types";
import { getAllProfiles } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import sendRTC from "../../redux/webrtc/actions/sendRTC";
import {
  SET_ANSWERS,
  SET_CANDIDATES,
  SET_OFFERS,
} from "../../redux/webrtc/types";
import { useAppDispatch } from "../../utils/helpers";

let peerConnection: undefined | RTCPeerConnection;

const Playground = () => {
  const dispatch = useAppDispatch();
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<null | MediaStream>(null);
  const [remoteStream, setRemoteStream] = useState<null | MediaStream>(null);

  const [agents, setAgents] = useState<AgentPubKeyB64[]>([]);

  const onIceCandidate = (event: any) => {
    if (event.candidate)
      dispatch(
        sendRTC(
          SIGNALS[ZOMES.WEBRTC].SEND_ICE_CANDIDATE,
          JSON.stringify(event.candidate),
          agents
        )
      );
  };

  const onTrack = (event: RTCTrackEvent) => {
    console.log(event);
    setRemoteStream(event.streams[0]!);
    if (!remoteVideo.current!.srcObject) {
      remoteVideo.current!.srcObject = event.streams[0];
      remoteVideo.current!.onloadedmetadata = function () {
        remoteVideo.current!.play();
        remoteVideo.current!.autoplay = true;
      };
    }
  };

  const createAndSendOffer = async () => {
    const offer = await peerConnection!.createOffer();
    await peerConnection!.setLocalDescription(offer);

    dispatch(
      sendRTC(SIGNALS[ZOMES.WEBRTC].SEND_OFFER, JSON.stringify(offer), agents)
    );
  };

  const createPeerConnection = () => {
    try {
      peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      });
      // peerConnection!.onnegotiationneeded = async () => {
      //   await createAndSendOffer();
      // };
      peerConnection!.onicecandidate = onIceCandidate;
      peerConnection!.ontrack = onTrack;
    } catch (e) {
      console.warn(`ERROR (createPeerConnection): ${e}`);
    }
  };

  const onStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      // const rtcPeerConnection = new RTCPeerConnection();
      await createPeerConnection();
      stream!
        .getTracks()
        .forEach((track) => peerConnection!.addTrack(track, stream!));
      setStream(stream);
      localVideo.current!.srcObject = stream;

      localVideo.current!.onloadedmetadata = function (e) {
        localVideo.current!.play();
        localVideo.current!.autoplay = true;
      };
    } catch (e) {
      console.warn(e);
    }
  };

  const onCall = async () => {
    const offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };

    const offer = await peerConnection!.createOffer(offerOptions);
    peerConnection!.setLocalDescription(offer).catch((e) => console.error(e));

    dispatch(
      sendRTC(SIGNALS[ZOMES.WEBRTC].SEND_OFFER, JSON.stringify(offer), agents)
    );
  };

  useEffect(() => {
    dispatch(getAllProfiles()).then((result: any) =>
      setAgents(
        result.map((agent: any) => deserializeHash(agent.agent_pub_key))
      )
    );
  }, []);

  const { offers, answers, candidates } = useSelector(
    (state: RootState) => state.webrtc
  );

  useEffect(() => {
    if (candidates.length > 0) {
      const top = JSON.parse(candidates.pop() as string);
      dispatch({ type: SET_CANDIDATES, candidates });

      console.group("Candidates: ");
      console.log(top, candidates);
      console.groupEnd();

      peerConnection?.addIceCandidate(top);
    }
  }, [candidates]);

  useEffect(() => {
    if (offers.length > 0) {
      // const newRTCPeerConnection = new RTCPeerConnection();
      const top = JSON.parse(offers.pop() as string);
      peerConnection!.setRemoteDescription(top).catch((e) => console.error(e));

      console.group("Offers: ");
      console.log(top, offers);
      console.groupEnd();

      dispatch({ type: SET_OFFERS, offers });

      peerConnection!.createAnswer().then((answer) => {
        peerConnection!
          .setLocalDescription(answer)
          .catch((e) => console.error(e));

        dispatch(
          sendRTC(
            SIGNALS[ZOMES.WEBRTC].SEND_ANSWER,
            JSON.stringify(answer),
            agents
          )
        );
      });
      // setPeerConnection(newRTCPeerConnection);
    }
  }, [offers]);

  useEffect(() => {
    if (answers.length > 0) {
      const top = JSON.parse(answers.pop() as string);

      console.group("Answers: ");
      console.log(top, answers);
      console.groupEnd();

      dispatch({ type: SET_ANSWERS, answers });
      peerConnection?.setRemoteDescription(top).catch((e) => console.error(e));
    }
  }, [answers]);

  return (
    <IonPage>
      <IonGrid>
        <IonRow>
          <IonCol style={{ backgroundColor: "blue" }}>
            <video ref={localVideo}></video>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol style={{ backgroundColor: "red" }}>
            <video ref={remoteVideo}></video>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonButton disabled={stream !== null} onClick={onStart}>
              Start
            </IonButton>
          </IonCol>
          <IonCol>
            <IonButton
              disabled={stream === null}
              color="success"
              onClick={onCall}
            >
              Call
            </IonButton>
          </IonCol>
          <IonCol>
            <IonButton disabled={stream === null} color="danger">
              End
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonPage>
  );
};

export default Playground;

//
// navigator.mediaDevices
//   .getUserMedia({
//     audio: true,
//     video: true,
//   })
//   .then((stream) => {
//     setStream(stream);
//     stream!.getTracks().forEach((track) => {
//       peerConnection!.addTrack(track, stream!);
//     });
//   });
// const rtcPeerConnection = new RTCPeerConnection();

// peerConnection!.addEventListener("track", (track) => {
//   localVideo.current!.srcObject = track.streams[0];
// });
// peerConnection!.addEventListener("icecandidate", (event) => {
//   if (event.candidate) {
//     dispatch(
//       sendRTC(
//         SIGNALS[ZOMES.WEBRTC].SEND_ICE_CANDIDATE,
//         JSON.stringify(event.candidate),
//         agents
//       )
//     );
//   }
// });

// const [peerConnection, setPeerConnection] =
//   useState<RTCPeerConnection | null>(null);
// const [remotePc, setRemotePc] = useState<RTCPeerConnection | null>(null);
