import React from 'react';
import {createStackNavigator, HeaderBackButton} from '@react-navigation/stack';
import {Unauthenticated} from './screenNames';
import Landing from '../app/Landing';
import Login from '../app/Login';
import {UnauthenticatedStackList} from '../utils/types';
import Register from '../app/Register';

const Stack = createStackNavigator<UnauthenticatedStackList>();

const UnauthenticatedNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName={Unauthenticated.LANDING}
    screenOptions={{
      headerTitle: '',
      headerStyle: {shadowOffset: {height: 0, width: 0}},
    }}>
    <Stack.Screen
      name={Unauthenticated.LANDING}
      options={{headerShown: false}}
      component={Landing}
    />
    <Stack.Screen
      name={Unauthenticated.LOGIN}
      options={({navigation}) => ({
        headerLeft: () => (
          <HeaderBackButton
            tintColor="#ff8000"
            onPress={() => navigation.goBack()}
          />
        ),
      })}
      component={Login}
    />
    <Stack.Screen
      name={Unauthenticated.REGISTER}
      options={({navigation}) => ({
        headerLeft: () => (
          <HeaderBackButton
            tintColor="#ff8000"
            label="Cancel"
            onPress={() => navigation.goBack()}
          />
        ),
      })}
      component={Register}
    />
  </Stack.Navigator>
);

export default UnauthenticatedNavigator;
