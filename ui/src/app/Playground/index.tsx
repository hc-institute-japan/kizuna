import { isPlatform } from "@ionic/react";
import React, { useEffect } from "react";
import TestRTCPeerConnectionLocal from "./webrtc";
declare let cordova: any;

// if (isPlatform("ios")) {
//   cordova.plugins.iosrtc.registerGlobals();

//   // load adapter.js
//   var adapterVersion = "latest";
//   var script = document.createElement("script");
//   script.type = "text/javascript";
//   script.src =
//     "https://webrtc.github.io/adapter/adapter-" + adapterVersion + ".js";
//   script.async = false;
//   document.getElementsByTagName("head")[0].appendChild(script);
// }

const Playground = () => {
  useEffect(() => {
    setTimeout(() => {
      TestRTCPeerConnectionLocal();
    }, 5000);
  }, []);
  return <div className="playground"></div>;
};

export default Playground;
