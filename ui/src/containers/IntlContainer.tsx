import React from "react";
import { IntlProvider } from "react-intl";
import messages from "../lang";

const IntlContainer: React.FC = ({ children }) => {
  const locale = "en";
  return (
    <IntlProvider messages={messages[locale]} defaultLocale="en" locale="es">
      {children}
    </IntlProvider>
  );
};

export default IntlContainer;
