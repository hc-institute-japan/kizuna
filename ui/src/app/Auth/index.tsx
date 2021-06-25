import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Spinner from "../../components/Spinner";
import { getMyProfile } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import Authenticated from "../Authenticated";
import Unauthenticated from "../Unauthenticated";

const Auth: React.FC = () => {
  const { username } = useSelector((state: RootState) => state.profile);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getMyProfile()).then((bool: boolean) => {
      setLoading(false);
    });
  }, [dispatch]);

  return loading ? (
    <Spinner />
  ) : username !== null ? (
    <Authenticated />
  ) : (
    <Unauthenticated />
  );
  // return <Playground />;
};

export default Auth;
