/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import 'react-native-get-random-values';
import ApolloContainer from './containers/ApolloContainer';
global.Buffer = global.Buffer || require('buffer').Buffer;
const App: () => React$Node = () => {
  return <ApolloContainer />;
};

export default App;
