import { ThunkAction } from "../../types";
import { SET_CREATE_PEER_CONNECTION } from "../types";

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
const createPeerConnection = (): ThunkAction => async (dispatch) => {
  dispatch({
    type: SET_CREATE_PEER_CONNECTION,
    createPeerConnection: true,
  });
};

export default createPeerConnection;
