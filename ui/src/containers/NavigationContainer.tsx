import 'react-native-gesture-handler';
import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';

const Navigation: React.FC = ({children}) => (
  <NavigationContainer>{children}</NavigationContainer>
);

export default Navigation;
