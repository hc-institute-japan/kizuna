import { useQuery } from "@apollo/client";
import { isPlatform } from "@ionic/react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import ME from "../../graphql/profile/queries/me";
import { setUsername } from "../../redux/profile/actions";
import { RootState } from "../../redux/reducers";
import Home from "../Home";
import Unauthenticated from "../Unauthenticated";

declare let cordova: any;

const GET_USER_DETAILS = (state: RootState) => {};

const Auth: React.FC = () => {
  const { username } = useSelector((state: RootState) => state.profile);
  const history = useHistory();
  const dispatch = useDispatch();
  useQuery(ME, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      const { username = null } = { ...data?.me };
      if (username) {
        dispatch(setUsername(username));
        history.push("/");
      }
    },
  });

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
};

export default Auth;
