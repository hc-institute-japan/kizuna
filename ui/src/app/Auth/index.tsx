import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/reducers";
import Home from "../Home";
import Unauthenticated from "../Unauthenticated";

const Auth: React.FC = () => {
  const { username } = useSelector((state: RootState) => state.profile);
  return username !== null ? <Home /> : <Unauthenticated />;
};

export default Auth;
