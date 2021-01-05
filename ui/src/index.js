/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import 'react-native-get-random-values';
import Container from './containers/Container';
import MainNavigator from './navigators/MainNavigator';
global.Buffer = global.Buffer || require('buffer').Buffer;
const App: () => React$Node = () => {
  return (
    <Container>
      <MainNavigator />
    </Container>
  );
};

export default App;
