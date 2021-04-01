import { useDispatch, useSelector } from "react-redux";
import { fetchMyUsername } from "../../redux/profile/actions";
import React, { useEffect } from "react";
import { RootState } from "../../redux/types";
import Authenticated from "../Authenticated";
import Unauthenticated from "../Unauthenticated";

const Auth: React.FC = () => {
  const { username } = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMyUsername());
  }, [dispatch]);

  // return <Playground />;
  return username !== null ? <Authenticated /> : <Unauthenticated />;
};

export default Auth;
