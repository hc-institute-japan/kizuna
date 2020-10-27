import {ActionType} from '../../utils/types';
import {SET_ID, SET_PROFILE} from './actionTypes';

const initialState = {
  id: null,
  username: null,
};

export default (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SET_PROFILE:
      return {
        id: action.profile.id,
        username: action.profile.username,
      };
    case SET_ID:
      return {
        id: action.id,
      };
    default:
      return state;
  }
};
