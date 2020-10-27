import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {Profile, PubKey} from '../../utils/types';
import {SET_PROFILE, SET_ID} from './actionTypes';

export const setProfile = (profile: Profile) => (
  dispatch: ThunkDispatch<void, {}, AnyAction>,
) => {
  dispatch({
    type: SET_PROFILE,
    profile,
  });
};

export const setId = (pubkey: PubKey) => (
  dispatch: ThunkDispatch<void, {}, AnyAction>,
) => {
  dispatch({
    type: SET_ID,
    id: pubkey,
  });
};
