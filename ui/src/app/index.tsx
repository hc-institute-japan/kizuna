/* Core CSS required for Ionic components to work properly */
import { setupConfig } from "@ionic/react";
import "@ionic/react/css/core.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/typography.css";
import React from "react";
/* Theme variables */
import "../theme/variables.css";

import Auth from "./Auth";
setupConfig({ mode: "md" });
const App: React.FC = () => <Auth />;

export default App;
