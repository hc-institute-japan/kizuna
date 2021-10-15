import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonModal,
  IonPage,
  IonText,
} from "@ionic/react";
import {
  arrowBack,
  callOutline,
  closeOutline,
  micOutline,
  videocamOutline,
  volumeHighOutline,
} from "ionicons/icons";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { SIGNALS, ZOMES } from "../../connection/types";
import { RootState } from "../../redux/types";
import acceptCall from "../../redux/webrtc/actions/acceptCall";
import sendRTC from "../../redux/webrtc/actions/sendRTC";
import {
  SET_ANSWERS,
  SET_CANDIDATES,
  SET_CREATE_OFFER,
  SET_CREATE_PEER_CONNECTION,
  SET_OFFERS,
} from "../../redux/webrtc/types";
import { useAppDispatch } from "../../utils/helpers";
import styles from "./style.module.css";
import { CallType, ModalProps } from "./types";

let peerConnection: RTCPeerConnection | null = null;

export const CallModalContext = createContext({
  show: (callback: (states: any) => CallType, props: ModalProps) => {},
  dismiss: () => {},
});

const RequestingCall: React.FC<ModalProps> = ({ name, agents, stream }) => {
  const { dismiss } = useCallModal();
  const localVideo = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (stream && localVideo.current) {
      localVideo.current!.srcObject = stream;
      localVideo.current!.onloadedmetadata = function (e) {
        localVideo.current!.play();
        localVideo.current!.autoplay = true;
      };
    }
  }, [stream]);

  return (
    <div className={styles["modal-container"]}>
      <div className={styles["local-video-container"]}></div>
      <div className="ion-padding">
        <IonButtons>
          <IonButton onClick={dismiss}>
            <IonIcon icon={arrowBack}></IonIcon>
          </IonButton>
        </IonButtons>
      </div>
      <IonContent className={styles.content}>
        <IonText className={styles["details"]}>
          <p className={`${styles.name} ion-no-margin`}>{name}</p>
          <p>{"...requesting"}</p>
        </IonText>
      </IonContent>
      <div className={`${styles["footer"]} ion-padding`}>
        <IonButtons>
          <IonButton
            fill="solid"
            className={styles["footer-button"]}
            color="danger"
            shape="round"
          >
            <IonIcon icon={callOutline}></IonIcon>
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton shape="round" className={styles["footer-button"]}>
            <IonIcon icon={micOutline} />
          </IonButton>
          <IonButton shape="round" className={styles["footer-button"]}>
            <IonIcon icon={volumeHighOutline} />
          </IonButton>
          <IonButton shape="round" className={styles["footer-button"]}>
            <IonIcon icon={videocamOutline} />
          </IonButton>
        </IonButtons>
      </div>
    </div>
  );
};

const ReceivingCall: React.FC<ModalProps> = ({
  name,
  stream = null,
  onAccept,
  onReject,
  agents,
}) => {
  const { dismiss } = useCallModal();
  const dispatch = useAppDispatch();

  return (
    <div className={styles["modal-container"]}>
      <div className="ion-padding">
        <IonButtons>
          <IonButton onClick={dismiss}>
            <IonIcon icon={arrowBack}></IonIcon>
          </IonButton>
        </IonButtons>
      </div>
      <IonContent className={styles.content}>
        {/* <div className={styles["modal-container"]}>
        <div className={`${styles.header} ion-padding`}></div>
        <div className={styles.content}>
        </div>
      </div> */}
        <IonText className={styles["details"]}>
          <p className={`${styles.name} ion-no-margin`}>{name}</p>
          <p>{"calling..."}</p>
        </IonText>
      </IonContent>
      <div className={`${styles["footer"]} ion-padding`}>
        <IonButtons>
          <IonButton
            onClick={() => {
              if (onReject) onReject();
            }}
            fill="solid"
            className={styles["footer-button"]}
            color="danger"
            shape="round"
          >
            <IonIcon icon={closeOutline}></IonIcon>
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton
            onClick={() => {
              // if (onAccept) {
              //   onAccept();

              dispatch({
                type: SET_CREATE_PEER_CONNECTION,
                createPeerConnection: true,
              });

              dispatch(acceptCall(agents!));
              // }
            }}
            shape="round"
            color="success"
            fill="solid"
            className={styles["footer-button"]}
          >
            <IonIcon icon={callOutline} />
          </IonButton>
        </IonButtons>
      </div>
    </div>
  );
};

const OngoingCall: React.FC<ModalProps> = ({ name, stream, remoteStream }) => {
  const { dismiss } = useCallModal();
  const localVideo = useRef<HTMLVideoElement | null>(null);
  const remoteVideo = useRef<HTMLVideoElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (stream && localVideo.current) {
      localVideo.current!.srcObject = stream;
      localVideo.current!.onloadedmetadata = function () {
        localVideo.current!.play();
        localVideo.current!.autoplay = true;
      };
    }
  }, [stream]);

  useEffect(() => {
    if (remoteStream && remoteVideo.current) {
      remoteVideo.current!.srcObject = remoteStream;
      remoteVideo.current!.onloadedmetadata = function () {
        remoteVideo.current!.play();
        remoteVideo.current!.autoplay = true;
      };
    }
  }, [remoteStream]);

  return (
    <div className={styles["modal-container"]}>
      <div className={`${styles.header} ion-padding`}>
        <IonButtons>
          <IonButton onClick={dismiss}>
            <IonIcon icon={arrowBack}></IonIcon>
          </IonButton>
        </IonButtons>
        <IonText className={styles["details"]}>
          <p className={`${styles.name} ion-no-margin`}>{name}</p>
        </IonText>
      </div>
      <IonContent className={styles.content}>
        <div ref={container} className={styles["video-container"]}>
          <video ref={remoteVideo}></video>

          <video ref={localVideo}></video>
        </div>
        {/* <div className={styles["modal-container"]}>
        <div className={`${styles.header} ion-padding`}></div>
        <div className={styles.content}>
        </div>
      </div> */}
        {/* <IonText className={styles["details"]}>
          <p className={`${styles.name} ion-no-margin`}>{name}</p>
          <p>{"...requesting"}</p>
        </IonText> */}
      </IonContent>
      <div className={`${styles["footer"]} ion-padding`}>
        <IonButtons>
          <IonButton
            fill="solid"
            className={styles["footer-button"]}
            color="danger"
            shape="round"
          >
            <IonIcon icon={callOutline}></IonIcon>
          </IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton shape="round" className={styles["footer-button"]}>
            <IonIcon icon={micOutline} />
          </IonButton>
          <IonButton shape="round" className={styles["footer-button"]}>
            <IonIcon icon={volumeHighOutline} />
          </IonButton>
          <IonButton shape="round" className={styles["footer-button"]}>
            <IonIcon icon={videocamOutline} />
          </IonButton>
        </IonButtons>
      </div>
    </div>
  );
};

export const useCallModal = () => {
  const context = useContext(CallModalContext);
  if (!context) throw Error("Cannot use modal context");
  return context;
};

const CALL_STATE = {
  RECEIVING: "RECEIVING",
  REQUESTING: "REQUESTING",
  ONGOING: "ONGOING",
};

type CallState =
  | { type: "RECEIVING"; props: ModalProps }
  | { type: "REQUESTING"; props: ModalProps }
  | { type: "ONGOING"; props: ModalProps };

const CallModalContainer: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<null | CallState>(null);
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>(
    undefined
  );
  const { createPeerConnection, createOffer } = useSelector(
    (state: RootState) => state.webrtc
  );
  const { offers, answers, candidates } = useSelector(
    (state: RootState) => state.webrtc
  );

  useEffect(() => {
    if (candidates.length > 0) {
      const top = JSON.parse(candidates.pop() as string);
      dispatch({ type: SET_CANDIDATES, candidates });

      // console.group("Candidates: ");
      // console.log(top, candidates);
      // console.groupEnd();

      peerConnection?.addIceCandidate(top);
    }
  }, [candidates]);

  useEffect(() => {
    if (offers.length > 0) {
      // const newRTCPeerConnection = new RTCPeerConnection();
      const top = JSON.parse(offers.pop() as string);
      // console.log(top);
      // console.log(rtcPeerConnection);
      peerConnection!.setRemoteDescription(top).catch((e) => console.error(e));

      // console.group("Offers: ");
      // console.log(top, offers);
      // console.groupEnd();

      dispatch({ type: SET_OFFERS, offers });

      peerConnection!.createAnswer().then((answer) => {
        peerConnection!
          .setLocalDescription(answer)
          .catch((e) => console.error(`Offers: ${e}`));
        show((state) => state.ONGOING, {
          name: state!.props!.name,
          stream,
          remoteStream,
        });
        dispatch(
          sendRTC(
            SIGNALS[ZOMES.WEBRTC].SEND_ANSWER,
            JSON.stringify(answer),
            state?.props.agents!
          )
        );
      });
      // setPeerConnection(newRTCPeerConnection);
    }
  }, [offers]);

  useEffect(() => {
    if (answers.length > 0) {
      const top = JSON.parse(answers.pop() as string);

      // console.group("Answers: ");
      // console.log(top, answers);
      // console.groupEnd();
      show((state) => state.ONGOING, { name: state!.props!.name });

      dispatch({ type: SET_ANSWERS, answers });
      peerConnection?.setRemoteDescription(top).catch((e) => console.error(e));
    }
  }, [answers]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (createOffer.length > 0) {
      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      };

      // console.log("here");
      peerConnection!.createOffer(offerOptions).then((offer) => {
        peerConnection!
          .setLocalDescription(offer)
          .catch((e) => console.error(e));

        dispatch(
          sendRTC(SIGNALS[ZOMES.WEBRTC].SEND_OFFER, JSON.stringify(offer), [
            createOffer[0],
          ])
        );
        dispatch({
          type: SET_CREATE_OFFER,
          createOffer: [],
        });
      });
    }
  }, [createOffer]);

  useEffect(() => {
    if (createPeerConnection) {
      peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
          { urls: "stun:stun01.sipphone.com" },
          { urls: "stun:stun.ekiga.net" },
          { urls: "stun:stun.fwdnet.net" },
          { urls: "stun:stun.ideasip.com" },
          { urls: "stun:stun.iptel.org" },
          { urls: "stun:stun.rixtelecom.se" },
          { urls: "stun:stun.schlund.de" },
          { urls: "stun:stunserver.org" },
          { urls: "stun:stun.softjoys.com" },
          { urls: "stun:stun.voiparound.com" },
          { urls: "stun:stun.voipbuster.com" },
          { urls: "stun:stun.voipstunt.com" },
          { urls: "stun:stun.voxgratia.org" },
          { urls: "stun:stun.xten.com" },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
          {
            urls: "turn:192.158.29.39:3478?transport=udp",
            credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            username: "28224511:1379330808",
          },
          {
            urls: "turn:192.158.29.39:3478?transport=tcp",
            credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            username: "28224511:1379330808",
          },
          {
            urls: "turn:turn.bistri.com:80",
            credential: "homeo",
            username: "homeo",
          },
          {
            urls: "turn:turn.anyfirewall.com:443?transport=tcp",
            credential: "webrtc",
            username: "webrtc",
          },
        ],
      });
      peerConnection!.onicecandidate = onIceCandidate;
      peerConnection!.ontrack = onTrack;

      if (stream)
        stream!
          .getTracks()
          .forEach((track) => peerConnection!.addTrack(track, stream!));

      dispatch({
        type: SET_CREATE_PEER_CONNECTION,
        createPeerConnection: false,
      });
    }
  }, [createPeerConnection]);

  const onIceCandidate = (event: any) => {
    if (event.candidate)
      dispatch(
        sendRTC(
          SIGNALS[ZOMES.WEBRTC].SEND_ICE_CANDIDATE,
          JSON.stringify(event.candidate),
          state?.props.agents!
        )
      );
  };

  const onTrack = (event: RTCTrackEvent) => {
    // console.log(event);
    setRemoteStream(event.streams[0]!);
    // if (!remoteVideo.current!.srcObject) {
    //   remoteVideo.current!.srcObject = event.streams[0];
    //   remoteVideo.current!.onloadedmetadata = function () {
    //     remoteVideo.current!.play();
    //     remoteVideo.current!.autoplay = true;
    //   };
    // }
  };

  const renderPage = () => {
    switch (state?.type) {
      case CALL_STATE.ONGOING:
        return (
          <OngoingCall
            {...state.props}
            stream={stream}
            remoteStream={remoteStream}
          />
        );
      case CALL_STATE.RECEIVING:
        return <ReceivingCall {...state.props} />;
      case CALL_STATE.REQUESTING:
        return (
          <RequestingCall
            {...state.props}
            stream={stream}
            remoteStream={remoteStream}
          />
        );
      default:
        return null;
    }
  };

  const dismiss = () => {
    setIsOpen(false);
    setState(null);
  };

  const show = (callback: (states: any) => CallType, props: ModalProps) => {
    setIsOpen(true);
    setState({ type: callback(CALL_STATE), props });
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => setStream(stream));
  };

  return (
    <CallModalContext.Provider
      value={{
        show,
        dismiss,
      }}
    >
      <IonModal isOpen={isOpen} onDidDismiss={dismiss}>
        <IonPage>{renderPage()}</IonPage>
      </IonModal>
      {children}
    </CallModalContext.Provider>
  );
};

export default CallModalContainer;
