// @ts-nocheck
/* global RTCPeerConnection */

//
// Container for this sample
//

var appContainer = document.getElementById("root");
appContainer.innerHTML = "";

//
// Sample getUserMedia
//

//
var localStream, localVideoEl;
function TestGetUserMedia() {
  localVideoEl = document.createElement("video");
  localVideoEl.style.height = "50vh";
  localVideoEl.setAttribute("autoplay", "autoplay");
  localVideoEl.setAttribute("playsinline", "playsinline");
  appContainer.appendChild(localVideoEl);

  return navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
      // Note: Use navigator.mediaDevices.enumerateDevices() Promise to get deviceIds
      /*
    video: {
      // Test Back Camera
      //deviceId: 'com.apple.avfoundation.avcapturedevice.built-in_video:0'
      //sourceId: 'com.apple.avfoundation.avcapturedevice.built-in_video:0'
      deviceId: {
        exact: 'com.apple.avfoundation.avcapturedevice.built-in_video:0'
      }
      // Test FrameRate
      frameRate:{ min: 15.0, max: 30.0 } // Note: Back camera may only support max 30 fps
    }, 
    audio: {
      deviceId: {
        exact: 'Built-In Microphone'
      }
    }*/
    })
    .then(function (stream) {
      console.log("getUserMedia.stream", stream);
      console.log("getUserMedia.stream.getTracks", stream.getTracks());

      // Note: Expose for debug
      localStream = stream;

      // Attach local stream to video element
      localVideoEl.srcObject = localStream;

      return localStream;
    })
    .catch(function (err) {
      console.log("getUserMedia.error", err, err.stack);
    });
}

//
// Sample RTCPeerConnection
//

var pc1, pc2;

var peerConnectionConfig = {
  offerToReceiveVideo: true,
  offerToReceiveAudio: true,
  //iceTransportPolicy: 'relay',
  sdpSemantics: "unified-plan",
  //sdpSemantics: 'plan-b',
  bundlePolicy: "max-compat",
  rtcpMuxPolicy: "negotiate",
  iceServers: [
    {
      urls: ["stun:stun.stunprotocol.org"],
    },
  ],
};

// This plugin handle 'addstream' and 'track' event for MediaStream creation.
var useTrackEvent = Object.getOwnPropertyDescriptors(
  RTCPeerConnection.prototype
).ontrack;

var peerVideoEl, peerStream;
function TestRTCPeerConnection(localStream) {
  pc1 = new RTCPeerConnection(peerConnectionConfig);
  pc2 = new RTCPeerConnection(peerConnectionConfig);

  if (useTrackEvent) {
    // Add local stream tracks to RTCPeerConnection
    var localPeerStream = new MediaStream();
    localStream.getTracks().forEach(function (track) {
      console.log("pc1.addTrack", track, localPeerStream);
      pc1.addTrack(track, localPeerStream);
    });

    // Note: Deprecated but supported
  } else {
    pc1.addStream(localStream);

    // Note: Deprecated Test removeStream
    // pc1.removeStream(pc1.getLocalStreams()[0]);<
  }

  // Basic RTCPeerConnection Local WebRTC Signaling follow.
  function onAddIceCandidate(pc, can) {
    console.log("addIceCandidate", pc, can);
    return (
      can &&
      pc.addIceCandidate(can).catch(function (err) {
        console.log("addIceCandidateError", err);
      })
    );
  }

  pc1.addEventListener("icecandidate", function (e) {
    onAddIceCandidate(pc2, e.candidate);
  });

  pc2.addEventListener("icecandidate", function (e) {
    onAddIceCandidate(pc1, e.candidate);
  });

  function setPeerVideoStream(stream) {
    // Create peer video element
    peerVideoEl = document.createElement("video");
    peerVideoEl.style.height = "50vh";
    peerVideoEl.setAttribute("autoplay", "autoplay");
    peerVideoEl.setAttribute("playsinline", "playsinline");
    appContainer.appendChild(peerVideoEl);

    // Note: Expose for debug
    peerStream = stream;

    // Attach peer stream to video element
    peerVideoEl.srcObject = peerStream;
  }

  if (useTrackEvent) {
    var newPeerStream;
    pc2.addEventListener("track", function (e) {
      console.log("pc2.track", e);
      newPeerStream = e.streams[0] || newPeerStream || new MediaStream();
      setPeerVideoStream(newPeerStream);
      newPeerStream.addTrack(e.track);
    });

    // Note: Deprecated but supported
  } else {
    pc2.addEventListener("addstream", function (e) {
      console.log("pc2.addStream", e);
      setPeerVideoStream(e.stream);
    });
  }

  pc1.addEventListener("iceconnectionstatechange", function (e) {
    console.log("pc1.iceConnectionState", e, pc1.iceConnectionState);

    if (pc1.iceConnectionState === "completed") {
      console.log("pc1.getSenders", pc1.getSenders());
      console.log("pc2.getReceivers", pc2.getReceivers());
    }
  });

  pc1.addEventListener("icegatheringstatechange", function (e) {
    console.log("pc1.iceGatheringStateChange", e);
  });

  pc1.addEventListener("negotiationneeded", function (e) {
    console.log("pc1.negotiatioNeeded", e);

    return pc1
      .createOffer()
      .then(function (d) {
        var desc = {
          type: d.type,
          sdp: d.sdp,
        };
        console.log("pc1.setLocalDescription", desc);
        return pc1.setLocalDescription(desc);
      })
      .then(function () {
        var desc = {
          type: pc1.localDescription.type,
          sdp: pc1.localDescription.sdp,
        };
        console.log("pc2.setLocalDescription", desc);
        return pc2.setRemoteDescription(desc);
      })
      .then(function () {
        console.log("pc2.createAnswer");
        return pc2.createAnswer();
      })
      .then(function (d) {
        var desc = {
          type: d.type,
          sdp: d.sdp,
        };
        console.log("pc2.setLocalDescription", desc);
        return pc2.setLocalDescription(d);
      })
      .then(function () {
        var desc = {
          type: pc2.localDescription.type,
          sdp: pc2.localDescription.sdp,
        };
        console.log("pc1.setRemoteDescription", desc);
        return pc1.setRemoteDescription(desc);
      })
      .catch(function (err) {
        console.log("pc1.createOffer.error", err);
      });
  });
}

function TestRTCPeerConnectionLocal() {
  // Note: This allow this sample to run on any Browser
  var cordova = window.cordova;
  if (cordova && cordova.plugins && cordova.plugins.iosrtc) {
    // Alternatively WebRTC API will be inside cordova.plugins.iosrtc namespace
    cordova.plugins.iosrtc.registerGlobals();

    // Enable iosrtc debug (Optional)
    cordova.plugins.iosrtc.debug.enable("*", true);
  }

  // Run sample
  TestGetUserMedia().then(function (localStream) {
    TestRTCPeerConnection(localStream);
  });
}

export default TestRTCPeerConnectionLocal;
