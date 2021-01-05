<<<<<<< Updated upstream
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

export default createStore(reducers, applyMiddleware(thunk));
=======
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";

import rootReducer from "./reducers";

export default createStore(rootReducer, applyMiddleware(thunk));
>>>>>>> Stashed changes
