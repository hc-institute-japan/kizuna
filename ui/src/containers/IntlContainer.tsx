import React from "react";
import { IntlProvider } from "react-intl";
import { useSelector } from "react-redux";
import LanguageSelector from "../app/LanguageSelector";
import messages from "../lang";
import { setLanguage } from "../redux/language/actions";
import { RootState } from "../redux/types";
import { useAppDispatch } from "../utils/services/ReduxService";

const IntlContainer: React.FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const language = useSelector((state: RootState) => {
    const reducerLanguage = state.language.language;
    if (reducerLanguage) return reducerLanguage;

    const storageLanguage = localStorage.getItem("language");
    if (storageLanguage) {
      dispatch(setLanguage(storageLanguage));
    }

    return null;
  });

  return language ? (
    <IntlProvider messages={messages[language]} defaultLocale="en" locale="en">
      {children}
    </IntlProvider>
  ) : (
    <LanguageSelector />
  );
};

export default IntlContainer;
