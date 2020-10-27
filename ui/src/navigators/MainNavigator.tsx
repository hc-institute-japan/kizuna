import {useQuery} from '@apollo/client';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ME from '../graphql/profile/queries/me.query';
import {setProfile} from '../redux/profile/actions';
import {RootState} from '../utils/types';
import AuthenticatedNavigator from './AuthenticatedNavigator';
import UnauthenticatedNavigator from './UnauthenticatedNavigator';

const MainNavigator: React.FC = () => {
  const {username} = useSelector((state: RootState) => state.profile);
  const dispatch = useDispatch();
  const [isComplete, setIsComplete] = useState(false);
  useQuery(ME, {
    onCompleted: ({me}) => {
      dispatch(setProfile(me));
      setIsComplete(true);
    },
  });

  if (isComplete) {
    if (username) {
      return <AuthenticatedNavigator />;
    } else {
      return <UnauthenticatedNavigator />;
    }
  }
  return null;
};

export default MainNavigator;
