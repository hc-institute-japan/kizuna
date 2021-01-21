import { isPlatform } from "@ionic/react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reducers";
import Home from "../Home";
import Unauthenticated from "../Unauthenticated";
declare let window: any;
declare let cordova: any;

const Auth: React.FC = () => {
  const { username } = useSelector((state: RootState) => state.profile);
  useEffect(() => {
    // Just for iOS devices.
    if (isPlatform("ios")) {
      cordova.plugins.iosrtc.registerGlobals();

      // load adapter.js
      var adapterVersion = "latest";
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://webrtc.github.io/adapter/adapter-" + adapterVersion + ".js";
      script.async = false;
      document.getElementsByTagName("head")[0].appendChild(script);
    }
  }, []);
  return username !== null ? <Home /> : <Unauthenticated />;
  // return <Playground />;
};

export default Auth;
