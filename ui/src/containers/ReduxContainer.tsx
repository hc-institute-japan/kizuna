<<<<<<< Updated upstream
import React from 'react';
import {Provider} from 'react-redux';
import store from '../redux/store';

const ReduxContainer: React.FC = ({children}) => {
  return <Provider store={store}>{children}</Provider>;
};
=======
import React from "react";
import { Provider } from "react-redux";
import store from "../redux/store";

interface Props {}

const ReduxContainer: React.FC<Props> = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);
>>>>>>> Stashed changes

export default ReduxContainer;
