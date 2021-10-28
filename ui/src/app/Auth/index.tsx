import { IonIcon, IonText } from "@ionic/react";
import { sadOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import Spinner from "../../components/Spinner";
import { getMyProfile } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import { useAppDispatch } from "../../utils/helpers";
import Authenticated from "../Authenticated";
import Unauthenticated from "../Unauthenticated";
import styles from "./style.module.css";

const Auth: React.FC = () => {
  const intl = useIntl();
  const { username } = useSelector((state: RootState) => state.profile);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getMyProfile()).then((bool: boolean) => {
      if (!bool) setErr(true);
      setLoading(false);
    });
  }, [dispatch]);

  const renderErrPage = () => (
    <div className={styles["err"]}>
      <IonIcon icon={sadOutline} />
      <IonText>{intl.formatMessage({ id: "app.auth.err" })}</IonText>
    </div>
  );

  return loading ? (
    <Spinner />
  ) : username !== null ? (
    <Authenticated />
  ) : !err ? (
    <Unauthenticated />
  ) : (
    renderErrPage()
  );
  // return <Playground />;
};

export default Auth;
