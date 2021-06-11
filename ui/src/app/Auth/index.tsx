import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchMyUsername } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import Authenticated from "../Authenticated";
import Unauthenticated from "../Unauthenticated";

const Auth: React.FC = () => {
  const { username } = useSelector((state: RootState) => state.profile);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMyUsername()).then((bool: boolean) => {
      setLoading(false);
    });
  }, [dispatch]);

  /* TODO: Maybe better to load here while username is getting fetched */
  return username !== null ? (
    <Authenticated />
  ) : (
    <Unauthenticated />
    // return <Playground />;
  );
};

export default Auth;
