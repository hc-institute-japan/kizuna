import { IonButton, IonCol, IonGrid, IonPage, IonRow } from "@ionic/react";
import React from "react";
import { useCallModal } from "../../containers/CallModalContainer";
import { useAppDispatch } from "../../utils/helpers";

let peerConnection: undefined | RTCPeerConnection;

const Playground = () => {
  const { show, dismiss } = useCallModal();
  const dispatch = useAppDispatch();

  // const createPeerConnection = () => {
  //   try {
  //     peerConnection = new RTCPeerConnection({
  //       iceServers: [
  //         { urls: "stun:stun.l.google.com:19302" },
  //         { urls: "stun:stun1.l.google.com:19302" },
  //         { urls: "stun:stun2.l.google.com:19302" },
  //         { urls: "stun:stun3.l.google.com:19302" },
  //         { urls: "stun:stun4.l.google.com:19302" },
  //         { urls: "stun:stun01.sipphone.com" },
  //         { urls: "stun:stun.ekiga.net" },
  //         { urls: "stun:stun.fwdnet.net" },
  //         { urls: "stun:stun.ideasip.com" },
  //         { urls: "stun:stun.iptel.org" },
  //         { urls: "stun:stun.rixtelecom.se" },
  //         { urls: "stun:stun.schlund.de" },
  //         { urls: "stun:stunserver.org" },
  //         { urls: "stun:stun.softjoys.com" },
  //         { urls: "stun:stun.voiparound.com" },
  //         { urls: "stun:stun.voipbuster.com" },
  //         { urls: "stun:stun.voipstunt.com" },
  //         { urls: "stun:stun.voxgratia.org" },
  //         { urls: "stun:stun.xten.com" },
  //         {
  //           urls: "turn:numb.viagenie.ca",
  //           credential: "muazkh",
  //           username: "webrtc@live.com",
  //         },
  //         {
  //           urls: "turn:192.158.29.39:3478?transport=udp",
  //           credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
  //           username: "28224511:1379330808",
  //         },
  //         {
  //           urls: "turn:192.158.29.39:3478?transport=tcp",
  //           credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
  //           username: "28224511:1379330808",
  //         },
  //         {
  //           urls: "turn:turn.bistri.com:80",
  //           credential: "homeo",
  //           username: "homeo",
  //         },
  //         {
  //           urls: "turn:turn.anyfirewall.com:443?transport=tcp",
  //           credential: "webrtc",
  //           username: "webrtc",
  //         },
  //       ],
  //     });

  //     // peerConnection!.onnegotiationneeded = async () => {
  //     //   await createAndSendOffer();
  //     // };
  //     peerConnection!.onicecandidate = onIceCandidate;
  //     peerConnection!.ontrack = onTrack;
  //   } catch (e) {
  //     console.warn(`ERROR (createPeerConnection): ${e}`);
  //   }
  // };

  // const onIceCandidate = (event: any) => {
  //   if (event.candidate)
  //     dispatch(
  //       sendRTC(
  //         SIGNALS[ZOMES.WEBRTC].SEND_ICE_CANDIDATE,
  //         JSON.stringify(event.candidate),
  //         agents
  //       )
  //     );
  // };

  // const onTrack = (event: RTCTrackEvent) => {
  //   // console.log(event);
  //   // setRemoteStream(event.streams[0]!);
  //   if (!remoteVideo.current!.srcObject) {
  //     remoteVideo.current!.srcObject = event.streams[0];
  //     remoteVideo.current!.onloadedmetadata = function () {
  //       remoteVideo.current!.play();
  //       remoteVideo.current!.autoplay = true;
  //     };
  //   }
  // };

  const onRequest = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // await createPeerConnection();
    // stream!
    //   .getTracks()
    //   .forEach((track) => peerConnection!.addTrack(track, stream!));

    show((state) => state.REQUESTING, { name: "requesting", stream });
  };

  const onReceive = () =>
    show((state) => state.RECEIVING, { name: "receiving" });

  const onGoing = () => show((state) => state.ONGOING, { name: "ongoing" });

  return (
    <IonPage>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonButton onClick={onRequest}>Requesting</IonButton>
          </IonCol>
          <IonCol>
            <IonButton onClick={onGoing}>Ongoing</IonButton>
          </IonCol>
          <IonCol>
            <IonButton onClick={onReceive}>Receiving</IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonPage>
  );
};

export default Playground;

// const dispatch = useAppDispatch();
//   const localVideo = useRef<HTMLVideoElement>(null);
//   const remoteVideo = useRef<HTMLVideoElement>(null);
//   const [stream, setStream] = useState<null | MediaStream>(null);
//   const [remoteStream, setRemoteStream] = useState<null | MediaStream>(null);

//   const [agents, setAgents] = useState<AgentPubKeyB64[]>([]);

//   const onIceCandidate = (event: any) => {
//     if (event.candidate)
//       dispatch(
//         sendRTC(
//           SIGNALS[ZOMES.WEBRTC].SEND_ICE_CANDIDATE,
//           JSON.stringify(event.candidate),
//           agents
//         )
//       );
//   };

//   const onTrack = (event: RTCTrackEvent) => {
//     // console.log(event);
//     setRemoteStream(event.streams[0]!);
//     if (!remoteVideo.current!.srcObject) {
//       remoteVideo.current!.srcObject = event.streams[0];
//       remoteVideo.current!.onloadedmetadata = function () {
//         remoteVideo.current!.play();
//         remoteVideo.current!.autoplay = true;
//       };
//     }
//   };

//   const createAndSendOffer = async () => {
//     const offer = await peerConnection!.createOffer();
//     await peerConnection!.setLocalDescription(offer);

//     dispatch(
//       sendRTC(SIGNALS[ZOMES.WEBRTC].SEND_OFFER, JSON.stringify(offer), agents)
//     );
//   };

//   const createPeerConnection = () => {
//     try {
//       peerConnection = new RTCPeerConnection({
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           { urls: "stun:stun1.l.google.com:19302" },
//           { urls: "stun:stun2.l.google.com:19302" },
//           { urls: "stun:stun3.l.google.com:19302" },
//           { urls: "stun:stun4.l.google.com:19302" },
//           { urls: "stun:stun01.sipphone.com" },
//           { urls: "stun:stun.ekiga.net" },
//           { urls: "stun:stun.fwdnet.net" },
//           { urls: "stun:stun.ideasip.com" },
//           { urls: "stun:stun.iptel.org" },
//           { urls: "stun:stun.rixtelecom.se" },
//           { urls: "stun:stun.schlund.de" },
//           { urls: "stun:stunserver.org" },
//           { urls: "stun:stun.softjoys.com" },
//           { urls: "stun:stun.voiparound.com" },
//           { urls: "stun:stun.voipbuster.com" },
//           { urls: "stun:stun.voipstunt.com" },
//           { urls: "stun:stun.voxgratia.org" },
//           { urls: "stun:stun.xten.com" },
//           {
//             urls: "turn:numb.viagenie.ca",
//             credential: "muazkh",
//             username: "webrtc@live.com",
//           },
//           {
//             urls: "turn:192.158.29.39:3478?transport=udp",
//             credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
//             username: "28224511:1379330808",
//           },
//           {
//             urls: "turn:192.158.29.39:3478?transport=tcp",
//             credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
//             username: "28224511:1379330808",
//           },
//           {
//             urls: "turn:turn.bistri.com:80",
//             credential: "homeo",
//             username: "homeo",
//           },
//           {
//             urls: "turn:turn.anyfirewall.com:443?transport=tcp",
//             credential: "webrtc",
//             username: "webrtc",
//           },
//         ],
//       });

//       // peerConnection!.onnegotiationneeded = async () => {
//       //   await createAndSendOffer();
//       // };
//       peerConnection!.onicecandidate = onIceCandidate;
//       peerConnection!.ontrack = onTrack;
//     } catch (e) {
//       console.warn(`ERROR (createPeerConnection): ${e}`);
//     }
//   };

//   const onStart = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: true,
//       });
//       // const rtcPeerConnection = new RTCPeerConnection();
//       await createPeerConnection();
//       stream!
//         .getTracks()
//         .forEach((track) => peerConnection!.addTrack(track, stream!));
//       setStream(stream);
//       localVideo.current!.srcObject = stream;

//       localVideo.current!.onloadedmetadata = function (e) {
//         localVideo.current!.play();
//         localVideo.current!.autoplay = true;
//       };
//     } catch (e) {
//       console.warn(e);
//     }
//   };

//   const onCall = async () => {
//     const offerOptions = {
//       offerToReceiveAudio: true,
//       offerToReceiveVideo: true,
//     };

//     const offer = await peerConnection!.createOffer(offerOptions);
//     peerConnection!.setLocalDescription(offer).catch((e) => console.error(e));

//     dispatch(
//       sendRTC(SIGNALS[ZOMES.WEBRTC].SEND_OFFER, JSON.stringify(offer), agents)
//     );
//   };

//   useEffect(() => {
//     dispatch(getAllProfiles()).then((result: any) =>
//       setAgents(
//         result.map((agent: any) => deserializeHash(agent.agent_pub_key))
//       )
//     );
//   }, []);

//   const { offers, answers, candidates } = useSelector(
//     (state: RootState) => state.webrtc
//   );

//   useEffect(() => {
//     if (candidates.length > 0) {
//       const top = JSON.parse(candidates.pop() as string);
//       dispatch({ type: SET_CANDIDATES, candidates });

//       // console.group("Candidates: ");
//       // console.log(top, candidates);
//       // console.groupEnd();

//       peerConnection?.addIceCandidate(top);
//     }
//   }, [candidates]);

//   useEffect(() => {
//     if (offers.length > 0) {
//       // const newRTCPeerConnection = new RTCPeerConnection();
//       const top = JSON.parse(offers.pop() as string);
//       // console.log(top);
//       peerConnection!.setRemoteDescription(top).catch((e) => console.error(e));

//       // console.group("Offers: ");
//       // console.log(top, offers);
//       // console.groupEnd();

//       dispatch({ type: SET_OFFERS, offers });

//       peerConnection!.createAnswer().then((answer) => {
//         peerConnection!
//           .setLocalDescription(answer)
//           .catch((e) => console.error(e));

//         dispatch(
//           sendRTC(
//             SIGNALS[ZOMES.WEBRTC].SEND_ANSWER,
//             JSON.stringify(answer),
//             agents
//           )
//         );
//       });
//       // setPeerConnection(newRTCPeerConnection);
//     }
//   }, [offers]);

//   useEffect(() => {
//     if (answers.length > 0) {
//       const top = JSON.parse(answers.pop() as string);

//       // console.group("Answers: ");
//       // console.log(top, answers);
//       // console.groupEnd();

//       dispatch({ type: SET_ANSWERS, answers });
//       peerConnection?.setRemoteDescription(top).catch((e) => console.error(e));
//     }
//   }, [answers]);

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
