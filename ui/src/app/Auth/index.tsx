import { isPlatform } from "@ionic/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { fetchMyUsername } from "../../redux/profile/actions";
import { RootState } from "../../redux/reducers";
import Home from "../Home";
import Unauthenticated from "../Unauthenticated";

declare let cordova: any;

const Auth: React.FC = () => {
  const { username } = useSelector((state: RootState) => state.profile);
  const history = useHistory();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMyUsername());
  }, []);

  useEffect(() => {
    /**
     *
     * For iOS devices
     *
     */
    if (isPlatform("ios")) {
      cordova.plugins.iosrtc.registerGlobals();
      let adapterVersion = "latest";
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://webrtc.github.io/adapter/adapter-" + adapterVersion + ".js";
      script.async = false;
      document.getElementsByTagName("head")[0].appendChild(script);
    }
  }, []);

  return username !== null ? <Home /> : <Unauthenticated />;
};

export default Auth;
